const express = require("express");
const router = express.Router();
const generateOTP = require("../utils/otp");
const { sendOTP } = require("../services/otpServer");  // ✅ add

// Temporary memory storage (DB er sathe pore korte parba)
let otpStore = {};

// ================== EMPLOYER REGISTER (OTP Generate) ==================
router.post("/register", async (req, res) => {
  try {
    const { phone } = req.body;  // frontend theke phone number pathabe

    if (!phone) {
      return res.status(400).json({ msg: "Phone number is required" });
    }

    const otp = generateOTP();
    otpStore[phone] = otp;

    // ✅ OTP send via SMS/Email
    await sendOTP(phone, otp);

    console.log(`✅ OTP for ${phone}: ${otp}`);

    res.json({ msg: "OTP sent successfully! Please check your phone." });
  } catch (err) {
    console.error("OTP Send Error:", err.message);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});

// ================== VERIFY OTP ==================
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!otpStore[phone]) {
    return res.status(400).json({ msg: "No OTP found for this phone" });
  }

  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    return res.json({ msg: "OTP verified successfully!" });
  } else {
    return res.status(400).json({ msg: "Invalid OTP" });
  }
});

module.exports = router;
