const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const generateOTP = require("../utils/otpService");
const fetch = require("node-fetch"); // Fast2SMS জন্য

// temporary memory storage
let otpStore = {};

// ================= REGISTER + OTP GENERATE =================
router.post("/register", async (req, res) => {
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
      return res.status(400).json({ msg: "Email already registered" });

    const otp = generateOTP();
    otpStore[email] = otp;

    // Fast2SMS API call
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "v3",
        sender_id: "FSTSMS",
        message: `Your OTP for Proxima Skills is ${otp}`,
        language: "english",
        flash: 0,
        numbers: mobile
      })
    });

    // save student with isVerified = false
    const student = new Student({ name, email, password, mobile });
    await student.save();

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
    await Student.findOneAndUpdate({ email }, { isVerified: true });
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
