// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/student");                                                 
const { sendOtp, verifyOtp } = require("../services/otpService");
console.log("Type of sendOtp:", typeof sendOtp);
console.log("Type of verifyOtp:", typeof verifyOtp);

// ================= REGISTER + OTP GENERATE =================                                                                                
router.post("/register", async (req, res) => {
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile)
    return res.status(400).json({ msg: "All fields are required" });
                                                                                                              
  try {
    const existingStudent = await Student.findOne({ email });                             
    if (existingStudent)
      return res.status(400).json({ msg: "Email already registered" });

    // ✅ Send OTP (otpService নিজেই OTP generate + store করে রাখবে)
    try {
      await sendOtp(mobile);
    } catch (err) {
      console.error("⚠️ OTP send failed:", err.message);
    }

    // ✅ Save student with isVerified = false
    const student = new Student({
      name,
      email,
      password,
      mobile,
      isVerified: false,
    });
    await student.save();

    res.json({ msg: "OTP sent! Check your mobile." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  const { email, mobile, otp } = req.body;

  if (!otp)
    return res.status(400).json({ msg: "OTP is required" });

  // ✅ Verify OTP from otpService
  const isValid = verifyOtp(mobile, otp);

  if (!isValid)
    return res.status(400).json({ msg: "Invalid OTP" });

  await Student.findOneAndUpdate({ email }, { isVerified: true });
  return res.json({ msg: "OTP verified successfully! You can now login." });
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const student = await Student.findOne({ email, password });
    if (!student)
      return res.status(400).json({ msg: "Invalid credentials" });

    if (!student.isVerified)
      return res.status(400).json({ msg: "Please verify OTP first" });

    res.json({ msg: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
