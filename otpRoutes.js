const express = require("express");
const { sendOtp, verifyOtp } = require("../services/otpService");

const router = express.Router();

// ✅ Send OTP
router.post("/send", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const response = await sendOtp(phone);
    res.json({ success: true, message: "OTP sent", data: response });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone & OTP required" });
    }

    const isValid = await verifyOtp(phone, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

module.exports = router;
