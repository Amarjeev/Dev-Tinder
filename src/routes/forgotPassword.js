// ═════════════════════════════════════════════════════════════════════════════
// 🌱 Load Environment Variables
// ═════════════════════════════════════════════════════════════════════════════
require("dotenv").config(); // Load variables from .env (email credentials, etc.)

// ═════════════════════════════════════════════════════════════════════════════
// 📦 Module Imports
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// ✅ Create a new Express router
const forgotPassword = express.Router();

// ═════════════════════════════════════════════════════════════════════════════
// 🔒 In-Memory OTP Store (⚠️ Use Redis or DB for production)
// ═════════════════════════════════════════════════════════════════════════════
let otpStore = {};

// 🔧 Function to generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ═════════════════════════════════════════════════════════════════════════════
// ✉️ Configure Nodemailer Transporter (Gmail used here)
// ═════════════════════════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 📧 Sender email (from .env)
    pass: process.env.EMAIL_PASS, // 🔑 App password (from .env)
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// 🔐 Route: POST /forgot-password
// Purpose: Send OTP to user's email
// ═════════════════════════════════════════════════════════════════════════════
forgotPassword.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // 🛑 Validate email format
  if (!email || !email.includes("@")) {
    return res.status(400).send("Invalid email address");
  }

  // 🔍 Check if user exists
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return res.status(400).send("Email address not valid");
  }

  // 🔐 Generate and store OTP
  const otp = generateOTP();
  otpStore[email] = otp;

  // ⏲️ Expire OTP after 10 seconds (⚠️ Increase in production)
  setTimeout(() => {
    delete otpStore[email];
  }, 10 * 1000);

  // 📧 Email content & styling
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
    html: `
      <h1> 🤝 Dev Tinder</h1>
      <div style="font-family: Arial, sans-serif; color: #1F2937; padding: 20px;">
        <h2 style="color: #2563EB;">Your OTP Code</h2>
        <p style="font-size: 16px;">Use the following OTP to complete your login:</p>
        <p style="font-size: 24px; font-weight: bold; background: #E0E7FF; padding: 10px; border-radius: 6px; display: inline-block;">
          ${otp}
        </p>
        <h4 class="text-red-500 font-bold">Hurry! OTP is valid for just 1 minute.</h4>
      </div>
    `,
  };

  try {
    // 📤 Send OTP email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);

    // ⚠️ In production, never send the OTP in response!
    res.json(otp);
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Error sending OTP");
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// ✅ Route: POST /OtpVerification
// Purpose: Verify the entered OTP
// ═════════════════════════════════════════════════════════════════════════════
forgotPassword.post("/OtpVerification", async (req, res) => {
  try {
    const { enteredOtp, Otp } = req.body;

    // ✅ Simple comparison for demo (use better logic in production)
    if (Otp === enteredOtp) {
      res.send("Otp Correct");
    } else {
      res.send("Otp InCorrect");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).send("Server error during OTP verification");
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 🔑 Route: POST /PasswordChange
// Purpose: Change user's password after OTP verification
// ═════════════════════════════════════════════════════════════════════════════
forgotPassword.post("/PasswordChange", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🛑 Validate input
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required." });
    }

    // 🔍 Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // 🔐 Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // 💾 Update the password in database
    await User.updateOne({ email }, { password: passwordHash });

    res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).send("Server error during password change");
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 🚀 Export the Router
// ═════════════════════════════════════════════════════════════════════════════
module.exports = forgotPassword;
