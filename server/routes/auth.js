const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendTokenResponse, generateToken, generateOTP, generateRandomToken, hashToken } = require('../utils/tokenUtils');
const { sendVerificationEmail, sendPasswordResetEmail, sendEmailOTP } = require('../utils/emailService');
const { sendOTP } = require('../utils/smsService');

// Temporary storage for registration data (in production, use Redis)
const pendingRegistrations = new Map();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// @route   POST /api/auth/register/init
// @desc    Initialize registration - send email OTP
// @access  Public
router.post('/register/init', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone already exists (same message to prevent enumeration)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with these credentials already exists'
      });
    }

    // Generate email OTP
    const emailOTP = generateOTP();
    const registrationId = generateRandomToken();

    // Store pending registration
    pendingRegistrations.set(registrationId, {
      name,
      email,
      phone,
      password,
      emailOTP,
      emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      emailVerified: false,
      phoneVerified: false,
      createdAt: Date.now()
    });

    // Clean up old pending registrations (older than 30 minutes)
    for (const [key, value] of pendingRegistrations.entries()) {
      if (Date.now() - value.createdAt > 30 * 60 * 1000) {
        pendingRegistrations.delete(key);
      }
    }

    // Send email OTP
    await sendEmailOTP(email, name, emailOTP);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      registrationId,
      email
      // OTP removed for security - check email/SMS
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register/verify-email
// @desc    Verify email OTP during registration
// @access  Public
router.post('/register/verify-email', [
  body('registrationId').notEmpty().withMessage('Registration ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid 6-digit OTP')
], validate, async (req, res, next) => {
  try {
    const { registrationId, otp } = req.body;

    const registration = pendingRegistrations.get(registrationId);
    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please start again.'
      });
    }

    if (registration.emailOTP !== otp || Date.now() > registration.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark email as verified
    registration.emailVerified = true;
    pendingRegistrations.set(registrationId, registration);

    // Generate phone OTP
    const phoneOTP = generateOTP();
    registration.phoneOTP = phoneOTP;
    registration.phoneOTPExpires = Date.now() + 10 * 60 * 1000;
    pendingRegistrations.set(registrationId, registration);

    // Send phone OTP
    const smsResult = await sendOTP(registration.phone, phoneOTP);

    res.json({
      success: true,
      message: 'Email verified! OTP sent to your phone.',
      phone: registration.phone.slice(0, 2) + '****' + registration.phone.slice(-4)
      // OTP removed for security - check SMS
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register/verify-phone
// @desc    Verify phone OTP and complete registration
// @access  Public
router.post('/register/verify-phone', [
  body('registrationId').notEmpty().withMessage('Registration ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid 6-digit OTP')
], validate, async (req, res, next) => {
  try {
    const { registrationId, otp } = req.body;

    const registration = pendingRegistrations.get(registrationId);
    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please start again.'
      });
    }

    if (!registration.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    if (registration.phoneOTP !== otp || Date.now() > registration.phoneOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Create the user
    const user = await User.create({
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      password: registration.password,
      isEmailVerified: true,
      isPhoneVerified: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.name)}&background=random&size=200`
    });

    // Clean up pending registration
    pendingRegistrations.delete(registrationId);

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Amazon Ecommerce.');
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register/resend-email-otp
// @desc    Resend email OTP
// @access  Public
router.post('/register/resend-email-otp', [
  body('registrationId').notEmpty().withMessage('Registration ID is required')
], validate, async (req, res, next) => {
  try {
    const { registrationId } = req.body;

    const registration = pendingRegistrations.get(registrationId);
    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please start again.'
      });
    }

    // Generate new email OTP
    const emailOTP = generateOTP();
    registration.emailOTP = emailOTP;
    registration.emailOTPExpires = Date.now() + 10 * 60 * 1000;
    pendingRegistrations.set(registrationId, registration);

    // Send email OTP
    await sendEmailOTP(registration.email, registration.name, emailOTP);

    res.json({
      success: true,
      message: 'OTP resent to your email'
      // OTP removed for security
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register/resend-phone-otp
// @desc    Resend phone OTP
// @access  Public
router.post('/register/resend-phone-otp', [
  body('registrationId').notEmpty().withMessage('Registration ID is required')
], validate, async (req, res, next) => {
  try {
    const { registrationId } = req.body;

    const registration = pendingRegistrations.get(registrationId);
    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please start again.'
      });
    }

    if (!registration.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate new phone OTP
    const phoneOTP = generateOTP();
    registration.phoneOTP = phoneOTP;
    registration.phoneOTPExpires = Date.now() + 10 * 60 * 1000;
    pendingRegistrations.set(registrationId, registration);

    // Send phone OTP
    await sendOTP(registration.phone, phoneOTP);

    res.json({
      success: true,
      message: 'OTP resent to your phone'
      // OTP removed for security
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register
// @desc    Register user with email and password
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`
    });

    // Generate verification token
    const verificationToken = generateRandomToken();
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email (don't wait for it)
    sendVerificationEmail(email, name, verificationToken);

    sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password and lockout fields
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`
      });
    }

    // Check if user registered with different method
    if (!user.password && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: `Please login using ${user.authProvider}`
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      // Check if this attempt locked the account
      const updatedUser = await User.findById(user._id).select('loginAttempts lockUntil');
      const attemptsRemaining = 5 - updatedUser.loginAttempts;
      
      if (updatedUser.lockUntil) {
        return res.status(423).json({
          success: false,
          message: 'Account is now locked due to too many failed attempts. Please try again in 30 minutes.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${attemptsRemaining > 0 ? `${attemptsRemaining} attempts remaining.` : ''}`
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/phone/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/phone/send-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number')
], validate, async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({
        phone,
        name: `User_${phone.slice(-4)}`,
        authProvider: 'phone'
      });
    }

    user.phoneOTP = otp;
    user.phoneOTPExpires = otpExpires;
    await user.save();

    // Try to send SMS
    const smsResult = await sendOTP(phone, otp);
    
    // In production with real SMS
    if (!smsResult.success && !smsResult.mock) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
      // OTP removed for security - check SMS
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    next(err);
  }
});

// @route   POST /api/auth/phone/verify-otp
// @desc    Verify OTP and login/register
// @access  Public
router.post('/phone/verify-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid 6-digit OTP')
], validate, async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      phone,
      phoneOTP: otp,
      phoneOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    user.isPhoneVerified = true;
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Phone verification successful');
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    
    // Update last login
    req.user.lastLogin = new Date();
    req.user.save();
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// @route   POST /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res, next) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
