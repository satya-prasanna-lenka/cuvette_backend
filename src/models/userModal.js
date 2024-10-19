// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true, unique: true },
  employeeSize: { type: Number, required: true },
  phoneOtp: { type: String }, // OTP for phone
  emailOtp: { type: String }, // OTP for email
  phoneOtpExpiration: { type: Date }, // Phone OTP expiration
  emailOtpExpiration: { type: Date }, // Email OTP expiration
});

const User = mongoose.model("User", userSchema);
module.exports = User;
