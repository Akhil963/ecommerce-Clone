const nodemailer = require('nodemailer');
const axios = require('axios');

// Email service configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_CONFIGURED = !!SENDGRID_API_KEY;

const isSMTPConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;
let smtpTransporter = null;

// Initialize SMTP as fallback
if (isSMTPConfigured) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    connectionTimeout: 30000,      // Increased to 30 seconds
    socketTimeout: 30000,          // Increased to 30 seconds
    greetingTimeout: 15000,        // Increased to 15 seconds
    pool: {
      maxConnections: 3,           // Reduced for stability
      maxMessages: 100,
      rateDelta: 2000,
      rateLimit: 14
    }
  });
  console.log('✅ SMTP fallback configured');
}

if (SENDGRID_CONFIGURED) {
  console.log('✅ SendGrid email service configured (primary)');
} else if (isSMTPConfigured) {
  console.log('⚠️ SendGrid not configured. Using SMTP as fallback.');
} else {
  console.log('⚠️ No email service configured - emails will be logged to console');
}

// Retry logic utilities
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// SendGrid email sender
const sendViaSendGrid = async (options, retryCount = 0) => {
  const fromEmail = process.env.EMAIL_FROM || `noreply@ecommerce-clone.com`;
  const fromName = process.env.EMAIL_FROM_NAME || 'Amazon Ecommerce';

  const payload = {
    personalizations: [
      {
        to: [{ email: options.to }],
        subject: options.subject
      }
    ],
    from: {
      email: fromEmail,
      name: fromName
    },
    content: [
      {
        type: 'text/html',
        value: options.html || options.text
      }
    ]
  };

  try {
    await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Email sent via SendGrid to:', options.to);
    return true;
  } catch (error) {
    const isRetryable = error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || !error.response;
    
    if (isRetryable && retryCount < MAX_RETRIES) {
      console.warn(`⏱️ SendGrid timeout, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY);
      return sendViaSendGrid(options, retryCount + 1);
    }
    
    console.error('❌ SendGrid email failed:', {
      error: error.message,
      status: error.response?.status,
      to: options.to,
      subject: options.subject
    });
    return false;
  }
};

// SMTP email sender
const viaSmtp = async (options, retryCount = 0) => {
  if (!smtpTransporter) {
    return false;
  }

  const fromEmail = process.env.EMAIL_FROM || `"${process.env.EMAIL_FROM_NAME || 'Amazon Ecommerce'}" <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from: fromEmail,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    await smtpTransporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP to:', options.to);
    return true;
  } catch (error) {
    const isTimeoutError = error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'EHOSTUNREACH';
    
    if (isTimeoutError && retryCount < MAX_RETRIES) {
      console.warn(`⏱️ SMTP timeout, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY);
      return viaSmtp(options, retryCount + 1);
    }
    
    console.error('❌ SMTP email failed:', {
      error: error.message,
      code: error.code,
      to: options.to,
      subject: options.subject
    });
    return false;
  }
};

// Main send email function with automatic provider selection
exports.sendEmail = async (options) => {
  // No email service configured - log and return success
  if (!SENDGRID_CONFIGURED && !isSMTPConfigured) {
    console.log('📧 [DEV MODE] Email would be sent to:', options.to);
    console.log('   Subject:', options.subject);
    return true;
  }

  // Try SendGrid first (if configured), then SMTP as fallback
  if (SENDGRID_CONFIGURED) {
    const success = await sendViaSendGrid(options);
    if (success) return true;
    
    // If SendGrid fails and SMTP is available, try SMTP
    if (isSMTPConfigured) {
      console.log('📧 SendGrid failed, attempting SMTP fallback...');
      return await viaSmtp(options);
    }
    return false;
  }

  // Only SMTP available
  return await viaSmtp(options);
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
