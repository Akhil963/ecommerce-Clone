import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Register = () => {
  const navigate = useNavigate();

  // Steps: 1 = Form, 2 = Email OTP, 3 = Phone OTP, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // OTP states
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [phoneOTP, setPhoneOTP] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');

  const emailOTPRefs = useRef([]);
  const phoneOTPRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (currentStep === 2 && emailOTPRefs.current[0]) {
      setTimeout(() => emailOTPRefs.current[0]?.focus(), 100);
    } else if (currentStep === 3 && phoneOTPRefs.current[0]) {
      setTimeout(() => phoneOTPRefs.current[0]?.focus(), 100);
    }
  }, [currentStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Submit form and get email OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.registerInit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setRegistrationId(response.data.registrationId);
      setResendTimer(60);
      setCurrentStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index, value, type) => {
    // Only allow single digit
    const digit = value.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const otpArray = type === 'email' ? [...emailOTP] : [...phoneOTP];
    const refs = type === 'email' ? emailOTPRefs : phoneOTPRefs;
    const setOTP = type === 'email' ? setEmailOTP : setPhoneOTP;

    otpArray[index] = digit;
    setOTP(otpArray);

    // Auto-focus next input
    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e, type) => {
    const refs = type === 'email' ? emailOTPRefs : phoneOTPRefs;
    const otpArray = type === 'email' ? emailOTP : phoneOTP;

    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e, type) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const otpArray = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    if (type === 'email') {
      setEmailOTP(otpArray);
    } else {
      setPhoneOTP(otpArray);
    }
  };

  // Step 2: Verify email OTP
  const handleVerifyEmailOTP = async () => {
    const otp = emailOTP.join('');
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyEmailOTP({
        registrationId,
        otp
      });

      setMaskedPhone(response.data.phone);
      setResendTimer(60);
      setCurrentStep(3);
      toast.success('Email verified! OTP sent to your phone.');
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      // If session expired, go back to step 1
      if (message.includes('expired') || message.includes('start again')) {
        setCurrentStep(1);
        setRegistrationId(null);
        setEmailOTP(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify phone OTP and complete registration
  const handleVerifyPhoneOTP = async () => {
    const otp = phoneOTP.join('');
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyPhoneOTP({
        registrationId,
        otp
      });

      // Store token and user
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setCurrentStep(4);
      toast.success('Registration successful!');
      
      // Redirect after showing success
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      // If session expired, go back to step 1
      if (message.includes('expired') || message.includes('start again')) {
        setCurrentStep(1);
        setRegistrationId(null);
        setEmailOTP(['', '', '', '', '', '']);
        setPhoneOTP(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handlers
  const handleResendEmailOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      await authAPI.resendEmailOTP(registrationId);
      setResendTimer(60);
      setEmailOTP(['', '', '', '', '', '']);
      toast.success('OTP resent to your email');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      // If session expired, go back to step 1
      if (message.includes('expired') || message.includes('start again')) {
        setCurrentStep(1);
        setRegistrationId(null);
        toast.error('Session expired. Please fill the form again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhoneOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      await authAPI.resendPhoneOTP(registrationId);
      setResendTimer(60);
      setPhoneOTP(['', '', '', '', '', '']);
      toast.success('OTP resent to your phone');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      // If session expired, go back to step 1
      if (message.includes('expired') || message.includes('start again')) {
        setCurrentStep(1);
        setRegistrationId(null);
        toast.error('Session expired. Please fill the form again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'https://amazon-clone-api-2vgt.onrender.com/api'}/auth/google`;
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep > step
                  ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step
                  ? 'bg-amazon-orange border-amazon-orange text-white'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {currentStep > step ? (
                <CheckCircleSolid className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            <span className={`text-xs mt-1 ${currentStep >= step ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {step === 1 ? 'Details' : step === 2 ? 'Email' : 'Phone'}
            </span>
          </div>
          {index < 2 && (
            <div
              className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${
                currentStep > step ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-6">
          <span className="text-3xl font-bold">
            <span className="text-gray-900 dark:text-white">Amazon</span>
            <span className="text-amazon-orange">.Ecommerce</span>
          </span>
        </Link>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Step Indicator */}
          {currentStep < 4 && <StepIndicator />}

          {/* Step 1: Registration Form */}
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Create Account
              </h2>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent`}
                      placeholder="First and last name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">+91</span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-20 pr-3 py-3 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="ml-2">Sign up with Google</span>
                  </button>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-amazon-orange hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step 2: Email OTP Verification */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit OTP to
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">{formData.email}</p>
              </div>

              {/* Email OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {emailOTP.map((digit, index) => (
                    <input
                      key={`email-otp-${index}`}
                      ref={(el) => (emailOTPRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value, 'email')}
                      onKeyDown={(e) => handleOTPKeyDown(index, e, 'email')}
                      onPaste={(e) => handleOTPPaste(e, 'email')}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange focus:outline-none transition-all"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyEmailOTP}
                  disabled={loading || emailOTP.join('').length !== 6}
                  className="w-full py-3 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResendEmailOTP}
                    disabled={resendTimer > 0 || loading}
                    className={`text-sm ${
                      resendTimer > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-amazon-orange hover:underline cursor-pointer'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="mt-4 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-amazon-orange"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Change email address
              </button>
            </div>
          )}

          {/* Step 3: Phone OTP Verification */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verify Your Phone
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit OTP to
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">+91 {maskedPhone}</p>
              </div>

              {/* Phone OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {phoneOTP.map((digit, index) => (
                    <input
                      key={`phone-otp-${index}`}
                      ref={(el) => (phoneOTPRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value, 'phone')}
                      onKeyDown={(e) => handleOTPKeyDown(index, e, 'phone')}
                      onPaste={(e) => handleOTPPaste(e, 'phone')}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange focus:outline-none transition-all"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyPhoneOTP}
                  disabled={loading || phoneOTP.join('').length !== 6}
                  className="w-full py-3 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResendPhoneOTP}
                    disabled={resendTimer > 0 || loading}
                    className={`text-sm ${
                      resendTimer > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-amazon-orange hover:underline cursor-pointer'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">Email verified successfully!</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircleSolid className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Amazon Ecommerce!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your account has been created successfully.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircleSolid className="w-4 h-4 mr-2" />
                  Email verified
                </div>
                <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircleSolid className="w-4 h-4 mr-2" />
                  Phone verified
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Redirecting to homepage...
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        {currentStep === 1 && (
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to Amazon Ecommerce{' '}
            <Link to="/terms" className="text-amazon-orange hover:underline">
              Conditions of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-amazon-orange hover:underline">
              Privacy Notice
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
