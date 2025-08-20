const express = require("express");
const router = express.Router();
const Employer = require("../models/employer");
const { generateOTP } = require("../utils/otpService");
const sendOTP = require("../services/otpService");

// temporary memory storage (production এ Redis/DB use করা উচিত)
let otpStore = {};

// ================= REGISTER + OTP GENERATE =================
router.post("/register", async (req, res) => {
  const { companyName, email, password, phone } = req.body;

  if (!companyName || !email || !password || !phone)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer)
      return res.status(400).json({ msg: "Email already registered" });

    // ✅ Generate OTP
    const otp = generateOTP();
    otpStore[email] = otp;

    // ✅ Send OTP
    try {
      await sendOTP(phone, otp);
    } catch (err) {
      console.error("⚠️ OTP send failed (free API?):", err.message);
    }

    // ✅ Save employer with isVerified = false
    const employer = new Employer({ companyName, email, password, phone, isVerified: false });
    await employer.save();

    res.json({ msg: "OTP sent! Check your mobile." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email])
    return res.status(400).json({ msg: "No OTP found for this email" });

  if (otpStore[email] === otp) {
    await Employer.findOneAndUpdate({ email }, { isVerified: true });
    delete otpStore[email];
    return res.json({ msg: "OTP verified successfully! You can now login." });
  } else {
    return res.status(400).json({ msg: "Invalid OTP" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const employer = await Employer.findOne({ email, password });
    if (!employer)
      return res.status(400).json({ msg: "Invalid credentials" });

    if (!employer.isVerified)
      return res.status(400).json({ msg: "Please verify OTP first" });

    res.json({ msg: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
