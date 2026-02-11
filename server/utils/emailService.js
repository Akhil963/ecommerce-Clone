const nodemailer = require('nodemailer');

// Email configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Pending email queue for background retry
let emailQueue = [];

// Initialize email transporter with fallback support
let transporter = null;
let emailProvider = 'none';

// Helper to create transporter with timeout protection
function createTransporter(config) {
  return nodemailer.createTransport({
    ...config,
    connectionTimeout: 30000,
    socketTimeout: 30000,
    greetingTimeout: 15000,
    pool: {
      maxConnections: 2,
      maxMessages: 100,
      rateDelta: 2000,
      rateLimit: 14
    }
  });
}

// Try to initialize with primary SMTP config
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  try {
    transporter = createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    // Detect provider for logging
    if (process.env.SMTP_HOST.includes('brevo')) {
      emailProvider = 'Brevo';
    } else if (process.env.SMTP_HOST.includes('sendgrid')) {
      emailProvider = 'SendGrid';
    } else if (process.env.SMTP_HOST.includes('gmail')) {
      emailProvider = 'Gmail';
    } else {
      emailProvider = 'Custom SMTP';
    }
    
    console.log(`✅ Email service configured (${emailProvider})`);
  } catch (err) {
    console.error('❌ Failed to initialize email service:', err.message);
    transporter = null;
  }
} else {
  console.warn('⚠️  Email service not configured - using fallback mode');
}

// Send email with retry logic and fallback
exports.sendEmail = async (options, retryCount = 0) => {
  // If no transporter, log and queue for later
  if (!transporter) {
    console.log('📧 [NO EMAIL CONFIG] Would send to:', options.to, '| Subject:', options.subject);
    
    // Queue for retry when service is ready
    const emailItem = {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      timestamp: Date.now(),
      attempts: 0
    };
    
    emailQueue.push(emailItem);
    console.log(`📋 Email queued (queue length: ${emailQueue.length})`);
    
    return {
      success: true,
      queued: true,
      message: 'Email queued for delivery'
    };
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
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent via ${emailProvider} to: ${options.to}`);
    return { success: true, provider: emailProvider };
  } catch (error) {
    const isTimeoutError = error.code === 'ETIMEDOUT' || 
                          error.code === 'ECONNREFUSED' || 
                          error.code === 'EHOSTUNREACH' ||
                          error.code === 'ENOTFOUND';
    
    const isAuthError = error.code === 'EAUTH' || 
                        error.message.includes('401') ||
                        error.message.includes('authentication');
    
    // Retry on timeout errors
    if (isTimeoutError && retryCount < MAX_RETRIES) {
      const delay_ms = RETRY_DELAY * (retryCount + 1); // Exponential backoff
      console.warn(`⏱️  Connection timeout, retrying (${retryCount + 1}/${MAX_RETRIES}) in ${delay_ms}ms...`);
      await delay(delay_ms);
      return exports.sendEmail(options, retryCount + 1);
    }
    
    // Queue email for background retry on failure
    const emailItem = {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      timestamp: Date.now(),
      attempts: retryCount + 1,
      lastError: error.message
    };
    
    emailQueue.push(emailItem);
    
    console.error(`❌ Email send failed (${emailProvider}), queued for retry:`, {
      to: options.to,
      provider: emailProvider,
      error: error.message,
      attempts: retryCount + 1,
      queueLength: emailQueue.length
    });
    
    return {
      success: false,
      queued: true,
      provider: emailProvider,
      error: error.message
    };
  }
};

// Retry queued emails periodically
setInterval(async () => {
  if (emailQueue.length === 0 || !transporter) return;
  
  const retriable = emailQueue.filter(e => e.attempts < MAX_RETRIES);
  
  if (retriable.length > 0) {
    console.log(`📤 Retrying ${retriable.length} queued emails...`);
  }
  
  for (let i = emailQueue.length - 1; i >= 0; i--) {
    const email = emailQueue[i];
    
    if (email.attempts >= MAX_RETRIES) {
      console.error(`⛔ Permanently failed, removing from queue:`, email.to);
      emailQueue.splice(i, 1);
      continue;
    }
    
    try {
      const result = await exports.sendEmail({
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html
      }, email.attempts);
      
      if (result.success) {
        emailQueue.splice(i, 1);
        console.log(`✅ Retried email succeeded: ${email.to}`);
      }
    } catch (err) {
      console.error(`⚠️  Retry attempt failed for ${email.to}:`, err.message);
    }
  }
}, 5 * 60 * 1000); // Retry every 5 minutes

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
