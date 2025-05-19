require("dotenv").config(); // Load environment variables

const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const forgotPassword = express.Router();

// In-memory OTP store (for demo purposes; use a DB or cache in production)
let otpStore = {};

// Function to generate a 6-digit OTP as a string
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Create transporter AFTER loading env variables
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address from env
    pass: process.env.EMAIL_PASS, // Your email password from env
  },
});

// ✅ Route to handle OTP generation and email sending
forgotPassword.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if user with the given email exists
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return res.status(400).send("email address not valid");
  }

  // Validate email format
  if (!email || !email.includes("@")) {
    return res.status(400).send("Invalid email address");
  }

  // Generate OTP and store it in memory
  const otp = generateOTP();
  otpStore[email] = otp;

  // ✅ OTP expires after 10 seconds (for demo; increase in production)
  setTimeout(() => {
    delete otpStore[email];
  }, 10 * 1000);

  // Email options configuration
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
    // ✅ Send the OTP email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json(otp); // In production, don’t send OTP back in response
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Error sending OTP");
  }
});

// ✅ Route to verify the OTP entered by user
forgotPassword.post("/OtpVerification", async (req, res) => {
  try {
    const { enteredOtp, Otp } = req.body;
    console.log(Otp);

    // Simple match check — should be improved for production
    if (Otp === enteredOtp) {
      res.send("Otp Correct");
    } else {
      res.send("Otp InCorrect");
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Error sending OTP");
  }
});

// ✅ Placeholder route for password change (to be implemented)
forgotPassword.post("/PasswordChange", async (req, res) => {
  try {
    const { email, password } = req.body;
     if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required." });
    }
       const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
      // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.updateOne({ email }, { password: passwordHash });

    res.status(200).send({ message: "Password changed Success" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Error sending OTP");
  }
});

module.exports = forgotPassword;
