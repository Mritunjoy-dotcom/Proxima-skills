// services/otpServer.js
const fetch = require("node-fetch");
require("dotenv").config();

async function sendOTP(mobile, otp) {
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=v3&sender_id=FSTSMS&message=Your OTP is ${otp}&numbers=${mobile}`;
  
  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ OTP send failed:", err);
    throw err;
  }
}

module.exports = sendOTP;
