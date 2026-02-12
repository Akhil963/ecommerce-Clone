const nodemailer = require('nodemailer');

// MULTI-PROVIDER EMAIL CONFIGURATION
// Automatic fallback chain: Brevo → Zoho → Gmail

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@amazon-ecommerce.com';

// Configure available providers
const providers = [
  {
    name: 'Brevo',
    enabled: () => process.env.SMTP_USER && process.env.SMTP_PASSWORD,
    config: () => ({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  },
  {
    name: 'Zoho',
    enabled: () => process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS,
    config: () => ({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS
      }
    })
  },
  {
    name: 'Gmail',
    enabled: () => process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD,
    config: () => ({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  }
];

let transporters = {};
let emailServiceReady = false;

// Initialize available providers
function initializeEmailService() {
  console.log('📧 Initializing email service...');
  
  providers.forEach(provider => {
    if (provider.enabled()) {
      try {
        transporters[provider.name] = nodemailer.createTransport({
          ...provider.config(),
          connectionTimeout: 8000,
          socketTimeout: 8000,
          greetingTimeout: 3000,
          opportunisticTLS: false,
          pool: {
            maxConnections: 2,
            maxMessages: 50,
            rateDelta: 3000,
            rateLimit: 10
          }
        });
        console.log(`   ✅ ${provider.name} configured`);
      } catch (err) {
        console.error(`   ❌ ${provider.name} failed: ${err.message}`);
      }
    }
  });
  
  emailServiceReady = Object.keys(transporters).length > 0;
  
  if (emailServiceReady) {
    console.log(`\n✅ Email service ready with ${Object.keys(transporters).length} provider(s)`);
    console.log(`   Fallback chain: ${Object.keys(transporters).join(' → ')}`);
  } else {
    console.error('\n❌ Email service FAILED - No providers configured!');
    console.error('   Setup instructions:\n');
    console.error('   OPTION 1: Brevo SMTP');
    console.error('     Render Dashboard → Environment:');
    console.error('       SMTP_HOST=smtp-relay.brevo.com');
    console.error('       SMTP_PORT=465');
    console.error('       SMTP_USER=your-email@example.com');
    console.error('       SMTP_PASSWORD=xsmtpsib-...\n');
    console.error('   OPTION 2: Zoho Mail');
    console.error('     Render Dashboard → Environment:');
    console.error('       ZOHO_SMTP_USER=your-email@zoho.com');
    console.error('       ZOHO_SMTP_PASS=your-zoho-password\n');
    console.error('   OPTION 3: Gmail');
    console.error('     Render Dashboard → Environment:');
    console.error('       GMAIL_USER=your-email@gmail.com');
    console.error('       GMAIL_APP_PASSWORD=16-char-app-password');
  }
}

initializeEmailService();

// Try sending with automatic fallback between providers
async function sendWithFallback(mailOptions) {
  const providerNames = Object.keys(transporters);
  
  if (providerNames.length === 0) {
    throw new Error('No email providers configured');
  }
  
  let lastError;
  
  // Try each provider in order
  for (const providerName of providerNames) {
    const transporter = transporters[providerName];
    
    try {
      console.log(`📧 Trying ${providerName}...`);
      const response = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via ${providerName}`);
      return { success: true, provider: providerName, messageId: response.messageId };
    } catch (error) {
      lastError = error;
      console.warn(`   ⚠️  ${providerName} failed: ${error.message}`);
      
      // If auth error, don't try other providers
      if (error.message.includes('AUTH') || error.message.includes('Invalid')) {
        console.error(`   🔐 Authentication error - skipping other providers`);
        throw error;
      }
      
      // Try next provider
      if (providerName !== providerNames[providerNames.length - 1]) {
        console.log(`   🔄 Trying next provider...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

// Main send function
exports.sendEmail = async (options) => {
  if (!emailServiceReady) {
    console.error('❌ Email service not initialized');
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
    console.log(`\n📧 Sending email to: ${options.to}`);
    const result = await sendWithFallback(mailOptions);
    return result;
  } catch (error) {
    console.error('\n❌ Email delivery failed after all providers');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes('AUTH')) {
      console.error('💡 Check your email credentials on Render Dashboard');
    } else if (error.message.includes('timeout')) {
      console.error('💡 All providers timed out. Try:');
      console.error('   1. Add another provider (Zoho or Gmail)');
      console.error('   2. Check Render → CPU/Network status');
      console.error('   3. Contact email provider support');
    }
    
    return { success: false, error: error.message };
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
          <p>Thank you for registering! Please verify your email:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </p>
          <p>Link expires in 24 hours.</p>
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

// Send email OTP
exports.sendEmailOTP = async (email, name, otp) => {
  console.log(`📧 Sending OTP to ${email}`);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .otp-box { background: white; border: 2px solid #ff9900; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #232f3e; letter-spacing: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🔐 Email Verification</h1></div>
        <div class="content">
          <p>Hi ${name}, your verification code is:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>Code expires in 10 minutes. Do not share it.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Your Amazon Ecommerce Verification Code',
    html,
    text: `Your verification code is: ${otp}\n\nExpires in 10 minutes.`
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
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        .button { display: inline-block; background: #ff9900; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Password Reset</h1></div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Hi ${name},</p>
          <p>Click to reset your password (link expires in 1 hour):</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    text: `Click here to reset your password: ${resetUrl}`
  });
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (email, name, order) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #232f3e; color: white; padding: 20px; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #232f3e; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Order Confirmed!</h1></div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Hi ${name}, thanks for your order!</p>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
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
