const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employer", employerSchema);
