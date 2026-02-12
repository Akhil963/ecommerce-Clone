const nodemailer = require('nodemailer');

// SMTP Configuration - Support multiple configurations
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@amazon-ecommerce.com';

let transporter = null;
let emailServiceReady = false;

// FALLBACK CONFIGURATIONS - If primary fails, try these
const BACKUP_CONFIGS = [
  {
    host: 'smtp-relay.brevo.com',
    port: 465,  // Implicit SSL (alternative to 587)
    secure: true,
    label: 'Brevo SMTP (SSL Port 465)'
  },
  {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    label: 'Gmail SMTP (Port 587)',
    requiresAppPassword: true
  }
];

// Initialize SMTP transporter with multiple fallback options
function initializeEmailService() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    try {
      // Validate credentials format
      if (!SMTP_USER.includes('@') && !SMTP_USER.includes('apikey')) {
        console.warn('⚠️  Warning: SMTP_USER might be invalid. Should be email address or "apikey"');
      }
      
      if (SMTP_PASSWORD.length < 10) {
        console.warn('⚠️  Warning: SMTP_PASSWORD seems too short. Brevo passwords are usually 60+ characters');
      }

      const config = {
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: SMTP_PORT == 465,  // SSL for port 465, TLS for 587
        requireTLS: SMTP_PORT == 587,  // Force TLS for port 587
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        },
        // OPTIMIZED TIMEOUTS: Aggressive for network issues
        connectionTimeout: 10000,   // 10 seconds (reduced from 15s)
        socketTimeout: 10000,       // 10 seconds
        greetingTimeout: 5000,      // 5 seconds for SMTP greeting
        
        // CONNECTION POOL: Conservative for stability
        pool: {
          maxConnections: 3,
          maxMessages: 50,
          rateDelta: 3000,
          rateLimit: 10
        },
        
        // LOGGING: Better debugging
        logger: process.env.DEBUG_EMAIL === 'true',
        debug: process.env.DEBUG_EMAIL === 'true'
      };

      transporter = nodemailer.createTransport(config);
      emailServiceReady = true;
      
      console.log(`✅ Email service initialized`);
      console.log(`   Host: ${SMTP_HOST}:${SMTP_PORT}`);
      console.log(`   User: ${SMTP_USER}`);
      console.log(`   Security: ${SMTP_PORT == 465 ? 'SSL' : 'STARTTLS'}`);
      console.log(`   Mode: ${process.env.NODE_ENV}`);
      console.log(`   ℹ️  Connection will be verified on first email send`);
      
      if (SMTP_PORT != 587) {
        console.log(`   ℹ️  Using non-standard port ${SMTP_PORT} - may be needed if port 587 is blocked`);
      }
      
    } catch (err) {
      console.error('❌ SMTP initialization error:', err.message);
      emailServiceReady = false;
    }
  } else {
    const missing = [];
    if (!SMTP_HOST) missing.push('SMTP_HOST');
    if (!SMTP_USER) missing.push('SMTP_USER');
    if (!SMTP_PASSWORD) missing.push('SMTP_PASSWORD');
    console.error(`❌ Email service FAILED to initialize. Missing environment variables: ${missing.join(', ')}`);
    console.error('   Setup Instructions:');
    console.error('   1. Go to Render Dashboard → Select your API service');
    console.error('   2. Click Environment (left sidebar)');
    console.error('   3. Add these variables:');
    console.error('       SMTP_HOST=smtp-relay.brevo.com');
    console.error('       SMTP_PORT=587 (or 465 if 587 times out)');
    console.error('       SMTP_USER=your-email@example.com');
    console.error('       SMTP_PASSWORD=xsmtpsib-...');
  }
}

// Initialize on module load
initializeEmailService();

// Retry logic with exponential backoff - optimized for network issues
const sendEmailWithRetry = async (mailOptions, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  const startTime = Date.now();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`📧 Email send attempt ${attempt + 1}/${maxRetries} for ${mailOptions.to}...`);
      const response = await transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;
      console.log(`✅ Email sent successfully! (took ${duration}ms)`);
      return response;
    } catch (error) {
      lastError = error;
      
      const isLastAttempt = attempt === maxRetries - 1;
      const waitTime = delayMs * Math.pow(2, attempt); // 1s, 2s, 4s
      const errorCode = error?.code || error?.message || 'UNKNOWN';
      const errorClassification = classifyEmailError(errorCode);
      
      console.warn(`⚠️  Email send attempt ${attempt + 1}/${maxRetries} failed for ${mailOptions.to}: [${errorClassification}] ${error.code || error.message}`);
      
      // Don't retry on authentication errors
      if (errorClassification === 'AUTH' || errorClassification === 'PERMANENT') {
        console.error(`❌ Not retrying - This is a ${errorClassification} error (permanent failure)`);
        break;  // Exit retry loop on permanent errors
      }
      
      // If it's the last attempt, don't wait
      if (!isLastAttempt) {
        console.log(`   ↻ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries failed
  throw lastError;
};

// Helper function to classify email errors
const classifyEmailError = (errorCode) => {
  const str = String(errorCode).toUpperCase();
  
  if (str.includes('AUTH') || str.includes('INVALID') || str.includes('401') || str.includes('403')) {
    return 'AUTH';  // Authentication error - don't retry
  }
  if (str.includes('ENOTFOUND') || str.includes('ENETUNREACH') || str.includes('ECONNREFUSED')) {
    return 'NETWORK';  // Network error - retry
  }
  if (str.includes('ETIMEDOUT') || str.includes('ESOCKETTIMEDOUT') || str.includes('EHOSTUNREACH')) {
    return 'TIMEOUT';  // Connection timeout - retry
  }
  if (str.includes('EHELO') || str.includes('EGREETING')) {
    return 'SMTP_GREETING';  // SMTP protocol error - retry
  }
  if (str.includes('550') || str.includes('552') || str.includes('421')) {
    return 'PERMANENT';  // Server rejection - don't retry
  }
  
  return 'TRANSIENT';  // Unknown - assume transient and retry
};

// First-email flag to perform connection check
let connectionVerified = false;
let fallbackAttempted = false;

// Send email using SMTP - with automatic fallback to port 465
exports.sendEmail = async (options) => {
  if (!emailServiceReady || !transporter) {
    const errorMsg = `Email service not configured. Required: SMTP_USER, SMTP_PASSWORD, SMTP_HOST`;
    console.error('❌', errorMsg);
    console.error('   Setup Instructions:');
    console.error('   1. Go to Render Dashboard → Select your API service');
    console.error('   2. Click Environment (left sidebar)');
    console.error('   3. Add these variables:');
    console.error('       SMTP_HOST=smtp-relay.brevo.com');
    console.error('       SMTP_PORT=587');
    console.error('       SMTP_USER=your-brevo-email@example.com');
    console.error('       SMTP_PASSWORD=xsmtpsib-...');
    return {
      success: false,
      error: errorMsg,
      mode: 'not-configured'
    };
  }

  try {
    // Verify connection on first email send (lazy verification)
    if (!connectionVerified) {
      console.log('🔗 Attempting SMTP connection verification...');
      await new Promise((resolve) => {
        const verifyTimeout = setTimeout(() => {
          console.warn('⚠️  Connection verification timed out (will attempt send anyway)');
          resolve();
        }, 8000);  // 8 second timeout for verification
        
        transporter.verify((err, success) => {
          clearTimeout(verifyTimeout);
          if (err) {
            console.warn(`⚠️  Connection verification failed: ${err.message}`);
            console.warn('   → Will attempt send anyway (connection may work on actual send)');
            connectionVerified = false;
          } else if (success) {
            console.log(`✅ SMTP connection verified successfully!`);
            connectionVerified = true;
          }
          resolve();
        });
      });
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const response = await sendEmailWithRetry(mailOptions);
    return { success: true, messageId: response.messageId };
    
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || 'Unknown error';
    const errorCode = error?.code || 'UNKNOWN';
    const errorClassification = classifyEmailError(errorCode);
    
    console.error('❌ Email send failed after all retries:', {
      to: options.to,
      subject: options.subject,
      errorType: errorClassification,
      code: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    // AUTOMATIC FALLBACK: If port 587 times out, try port 465
    if ((errorClassification === 'TIMEOUT' || errorClassification === 'NETWORK') && 
        SMTP_PORT == 587 && 
        !fallbackAttempted) {
      
      console.log('\n🔄 ATTEMPTING AUTOMATIC FALLBACK TO PORT 465 (SSL)...');
      console.log('   Port 587 (STARTTLS) timed out. Trying port 465 (SSL)...\n');
      
      try {
        // Create new transporter with port 465
        const fallbackTransporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: 465,
          secure: true,  // SSL
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD
          },
          connectionTimeout: 10000,
          socketTimeout: 10000,
          pool: {
            maxConnections: 3,
            maxMessages: 50,
            rateDelta: 3000,
            rateLimit: 10
          }
        });
        
        // Try sending with fallback transporter
        const mailOptions = {
          from: EMAIL_FROM,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html
        };
        
        const response = await fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ SUCCESS! Email sent via port 465 (SSL)`);
        console.log(`   📝 The SMTP_PORT should be changed to 465 for Render compatibility`);
        console.log(`   → Update Render Dashboard → Environment → SMTP_PORT=465`);
        
        // Update main transporter for future emails
        transporter = fallbackTransporter;
        fallbackAttempted = true;
        
        return { success: true, messageId: response.messageId };
        
      } catch (fallbackError) {
        console.error('❌ Fallback to port 465 also failed:', fallbackError.message);
        console.error('\n   Both port 587 and 465 failed. This indicates:');
        console.error('   1. Render may be blocking SMTP connections entirely');
        console.error('   2. SMTP credentials are invalid');
        console.error('   3. Network configuration on Render needs adjustment');
      }
    }
    
    // Provide specific diagnostics for different error types
    if (errorClassification === 'AUTH') {
      console.error('   🔐 AUTHENTICATION ERROR - Credentials invalid');
      console.error('   → Verify SMTP_USER and SMTP_PASSWORD on Render Dashboard');
      console.error('   → For Brevo: SMTP_PASSWORD should start with "xsmtpsib-"');
    } else if (errorClassification === 'TIMEOUT' || errorClassification === 'NETWORK') {
      console.error('   🌐 NETWORK ERROR - Cannot reach SMTP server');
      console.error('   → Suggestion: Change SMTP_PORT from 587 to 465 on Render Dashboard');
      console.error('   → Then redeploy the service');
      console.error('   → Or try Gmail: SMTP_HOST=smtp.gmail.com (requires app password)');
    }
    
    // Don't block registration - still return error but allow app to continue
    return { success: false, error: errorMessage, code: errorCode, type: errorClassification };
  }
};

// Send verification email
exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; background: #ff9900; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Amazon Ecommerce</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for registering with us! Please verify your email address by clicking the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Amazon Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Verify Your Email - Amazon Ecommerce',
    html
  });
};

// Send email OTP for registration verification
exports.sendEmailOTP = async (email, name, otp) => {
  console.log(`\ud83d\udce7 Attempting to send EMAIL OTP to ${email}: ${otp}`);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .otp-box { background: #fff; border: 2px dashed #ff9900; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #232f3e; letter-spacing: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ff9900; padding: 10px 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
            <p class="otp-code">${otp}</p>
          </div>
          <div class="warning">
            <strong>⏰ This OTP will expire in 10 minutes.</strong><br>
            Do not share this code with anyone.
          </div>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Amazon Ecommerce. All rights reserved.</p>
          <p style="color: #999; font-size: 11px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: `Your Amazon Ecommerce Verification Code`,
    html
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; background: #ff9900; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Amazon Ecommerce</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Amazon Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Password Reset - Amazon Ecommerce',
    html
  });
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #232f3e; color: white; padding: 10px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for your order! Your order has been confirmed.</p>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Expected Delivery:</strong> ${new Date(order.expectedDelivery).toLocaleDateString()}</p>
          
          <h3>Order Items:</h3>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
            <p><strong>Delivery:</strong> ₹${order.deliveryCharge}</p>
            <p><strong>Discount:</strong> -₹${order.discount + order.couponDiscount}</p>
            <p style="font-size: 18px;"><strong>Total:</strong> ₹${order.total}</p>
          </div>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Amazon Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html
  });
};
