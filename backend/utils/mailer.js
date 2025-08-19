// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // tumar Gmail
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
});

async function sendMail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Proxima Skills" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Mail sent to", to);
  } catch (err) {
    console.error("❌ Mail error:", err);
  }
}

module.exports = sendMail;
