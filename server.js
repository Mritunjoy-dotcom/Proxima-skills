const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const employerRoutes = require("./routes/employerRoutes"); // ✅ Employer Routes import
const otpRoutes = require("./routes/otpRoutes"); // ✅ OTP routes import

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ✅ Default route to check server + DB
app.get("/", (req, res) => {
  res.send("✅ Server is running and MongoDB is connected!");
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/employers", employerRoutes); // ✅ Employer Routes added
app.use("/api/otp", otpRoutes); // ✅ OTP route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
