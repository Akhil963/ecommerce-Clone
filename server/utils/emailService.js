const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@amazon-ecommerce.com';

// Check which service to use
const usesSendGrid = !!process.env.SENDGRID_API_KEY;
const usesSMTP = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);

let emailServiceReady = false;
let transporters = {};

// Initialize email service
function initializeEmailService() {
  console.log('📧 Initializing email service...\n');
  
  // PRIORITY 1: SendGrid API (works on Render, no SMTP blocking)
  if (usesSendGrid) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      emailServiceReady = true;
      console.log('✅ SendGrid API configured (RECOMMENDED - works on Render!)');
      console.log('   Using HTTP API instead of SMTP - no connection timeouts\n');
      return;
    } catch (err) {
      console.error('❌ SendGrid API failed:', err.message);
    }
  }
  
  // PRIORITY 2: SMTP Providers (Brevo, Zoho, Gmail) - as fallback
  if (usesSMTP) {
    console.log('⚠️  SendGrid not configured. Trying SMTP providers...');
    console.log('   (Note: SMTP may be blocked on Render)\n');
    
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
  }
  
  if (!emailServiceReady) {
    console.error('\n❌ Email service NOT configured!\n');
    console.error('RECOMMENDED: Use SendGrid API (works on Render):');
    console.error('   1. Sign up: https://sendgrid.com (free account)');
    console.error('   2. Create API Key at Settings → API Keys');
    console.error('   3. Add to Render Environment:');
    console.error('       SENDGRID_API_KEY=SG_your_key_here\n');
    console.error('ALTERNATIVE: Use SMTP (may timeout on Render):');
    console.error('   SMTP_USER=your-email@example.com');
    console.error('   SMTP_PASSWORD=password');
    console.error('   ZOHO_SMTP_USER=your-email@zoho.com');
    console.error('   GMAIL_USER=your-email@gmail.com');
  } else {
    console.log(`\n✅ Email service ready!\n`);
  }
}

initializeEmailService();

// Send via SendGrid API
async function sendViaAPI(mailOptions) {
  try {
    const msg = {
      to: mailOptions.to,
      from: EMAIL_FROM,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html
    };
    
    await sgMail.send(msg);
    return { success: true, provider: 'SendGrid', sent: true };
  } catch (error) {
    throw new Error(`SendGrid API: ${error.message}`);
  }
}

// Try sending with SMTP providers
async function sendViaSMTP(mailOptions) {
  const providerNames = Object.keys(transporters);
  
  if (providerNames.length === 0) {
    throw new Error('No SMTP providers configured');
  }
  
  let lastError;
  
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
      
      // Exit on auth error
      if (error.message.includes('AUTH') || error.message.includes('Invalid')) {
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
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    console.log(`\n📧 Sending email to: ${options.to}`);
    
    // Try SendGrid API first (works on Render)
    if (usesSendGrid) {
      const result = await sendViaAPI(mailOptions);
      console.log(`✅ Email sent successfully via SendGrid!\n`);
      return result;
    }
    
    // Fall back to SMTP providers
    const result = await sendViaSMTP(mailOptions);
    return result;
    
  } catch (error) {
    console.error('\n❌ Email delivery failed');
    console.error(`   Error: ${error.message}\n`);
    
    if (!usesSendGrid) {
      console.error('💡 SOLUTION: Use SendGrid API instead of SMTP');
      console.error('   SendGrid works on Render (uses HTTP, not SMTP)');
      console.error('   Setup: https://sendgrid.com → Create API Key → Add to Render\n');
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
