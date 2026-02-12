const nodemailer = require('nodemailer');

// SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@amazon-ecommerce.com';

let transporter = null;
let emailServiceReady = false;

// Initialize SMTP transporter - production optimized
function initializeEmailService() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    try {
      console.log(`📧 Initializing email service...`);
      console.log(`   Host: ${SMTP_HOST}:${SMTP_PORT}`);
      console.log(`   User: ${SMTP_USER}`);
      
      // Determine security based on port
      const isSSL = SMTP_PORT == 465;
      
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: isSSL,           // SSL for 465, TLS for 587
        requireTLS: !isSSL,      // Require TLS for 587
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        },
        // OPTIMIZED FOR RENDER: Aggressive but reasonable timeouts
        connectionTimeout: 8000,    // 8 seconds
        socketTimeout: 8000,        // 8 seconds
        greetingTimeout: 3000,      // 3 seconds
        
        // CONNECTION POOL: Conservative for reliability
        pool: {
          maxConnections: 2,       // Keep connections low
          maxMessages: 50,
          rateDelta: 3000,
          rateLimit: 10            // ~8 emails per second max
        },
        
        // DISABLE OPPORTUNISTIC TLS: Some servers are slow to respond
        opportunisticTLS: false,
        
        // LOGGING
        logger: process.env.DEBUG_EMAIL === 'true',
        debug: process.env.DEBUG_EMAIL === 'true'
      });
      
      emailServiceReady = true;
      console.log(`✅ Email service ready (${isSSL ? 'SSL' : 'STARTTLS'} on port ${SMTP_PORT})`);
      
    } catch (err) {
      console.error('❌ Email service initialization failed:', err.message);
      emailServiceReady = false;
    }
  } else {
    const missing = [];
    if (!SMTP_HOST) missing.push('SMTP_HOST');
    if (!SMTP_USER) missing.push('SMTP_USER');
    if (!SMTP_PASSWORD) missing.push('SMTP_PASSWORD');
    console.error(`❌ Email service not configured. Missing: ${missing.join(', ')}`);
  }
}

initializeEmailService();
exports.sendEmail = async (options) => {
  if (!emailServiceReady || !transporter) {
    console.error('❌ Email service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    console.log(`📧 Sending to: ${options.to}`);
    
    // Try 3 times with primary SMTP
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent (attempt ${attempt}/3)`);
        return { success: true, messageId: response.messageId };
      } catch (error) {
        console.log(`   ⚠️  Attempt ${attempt}/3: ${error.message}`);
        
        // Exit early on auth errors
        if (error.message.toUpperCase().includes('AUTH')) {
          throw error;
        }
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
  } catch (primaryError) {
    console.error('❌ Email failed:', primaryError.message);
    
    // Try Gmail fallback if configured
    if (process.env.GMAIL_APP_PASSWORD && primaryError.message.includes('timeout')) {
      console.log('\n🔄 Trying Gmail fallback...');
      
      try {
        const gmailTransport = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_USER || SMTP_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          },
          connectionTimeout: 8000,
          socketTimeout: 8000
        });
        
        const response = await gmailTransport.sendMail(mailOptions);
        console.log(`✅ Email sent via Gmail!`);
        return { success: true, messageId: response.messageId };
      } catch (gmailError) {
        console.error(`❌ Gmail also failed: ${gmailError.message}`);
      }
    }
    
    console.error('\n💡 Suggestion:');
    if (primaryError.message.includes('timeout')) {
      console.error('   • Change SMTP_PORT to 465 on Render Dashboard');
      console.error('   • Or setup Gmail: GMAIL_USER=your@gmail.com, GMAIL_APP_PASSWORD=...');
    } else if (primaryError.message.toUpperCase().includes('AUTH')) {
      console.error('   • Verify SMTP_USER and SMTP_PASSWORD are correct');
    }
    
    return { success: false, error: primaryError.message };
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
