const twilio = require('twilio');

// Only initialize Twilio client if credentials are provided
let client = null;
const isTwilioConfigured = !!(
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER
);

if (isTwilioConfigured) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio SMS service initialized');
} else {
  console.log('⚠️ Twilio not configured - SMS features disabled. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable.');
}

// Send SMS utility
exports.sendSMS = async (to, message) => {
  if (!isTwilioConfigured || !client) {
    console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
    return { success: true, mock: true, message: 'SMS service not configured - message logged' };
  }
  
  try {
    // Format phone number to include country code if not present
    const formattedNumber = to.startsWith('+') ? to : `+91${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP via SMS
exports.sendOTP = async (phone, otp) => {
  const message = `Your Amazon Ecommerce verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await exports.sendSMS(phone, message);
};

// Send order status SMS
exports.sendOrderStatusSMS = async (phone, orderNumber, status) => {
  const statusMessages = {
    confirmed: `Your order ${orderNumber} has been confirmed! We'll notify you when it ships.`,
    shipped: `Great news! Your order ${orderNumber} has been shipped and is on its way.`,
    out_for_delivery: `Your order ${orderNumber} is out for delivery! It will arrive today.`,
    delivered: `Your order ${orderNumber} has been delivered. Thank you for shopping with us!`,
    cancelled: `Your order ${orderNumber} has been cancelled. Refund will be processed within 5-7 days.`
  };
  
  const message = statusMessages[status] || `Your order ${orderNumber} status has been updated to: ${status}`;
  return await exports.sendSMS(phone, message);
};
