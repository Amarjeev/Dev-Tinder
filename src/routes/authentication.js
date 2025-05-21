// ──────────────────────────────────────────────────────────────
// 📦 Required Modules
// ──────────────────────────────────────────────────────────────
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignupData } = require("../Helpers/Validation");

// ──────────────────────────────────────────────────────────────
// 🚀 Initialize Router
// ──────────────────────────────────────────────────────────────
const authRouter = express.Router();

// ──────────────────────────────────────────────────────────────
// ✍️ POST /signup — Register a new user
// ──────────────────────────────────────────────────────────────
authRouter.post("/signup", async (req, res) => {
  const { name, email, age, gender, password, photoUrl } = req.body;

  try {
    // 🔍 Check if email already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "📧 Email is already registered. Please use another email address.",
      });
    }

    // ✔️ Validate signup data format and requirements
    validateSignupData(req);

    // 🔒 Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 🆕 Create new user document
    const user = new User({
      name,
      email,
      age,
      gender,
      photoUrl,
      password: passwordHash,
    });

    // 💾 Save user to database
    await user.save();

    console.log("✅ User signup successful");
    res.status(201).send("User added successfully.");
  } catch (error) {
    // ⚠️ Handle errors during signup
    console.error("❌ Signup error:", error);
    res.status(500).send(error.message);
  }
});

// ──────────────────────────────────────────────────────────────
// 🔐 POST /login — Authenticate user & issue JWT token
// ──────────────────────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Find user by email
    const userData = await User.findOne({ email });

    if (!userData) {
      console.error("❌ Login failed: Email not found");
      return res.status(400).json({ emailerror: "Invalid email or password" });
    }

    // 🔑 Validate password
    const isPasswordMatch = await userData.validatePassword(password);

    if (!isPasswordMatch) {
      console.error("❌ Login failed: Incorrect password");
      return res.status(400).json({ emailerror: "Invalid email or password" });
    }

    // 🎫 Generate JWT token for authentication
    const token = await userData.getJWT();

    // 🍪 Set token in HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, secure: false });

    // 📤 Prepare user data to send back
    const userObj = userData.toObject();

    // ✅ Respond with user info and token
    res.status(200).json({
      userObj,
      token,
    });

    console.log("✅ Login successful");
  } catch (error) {
    // ⚠️ Handle errors during login
    console.error("❌ Login error:", error);
    res.status(500).send(error.message);
  }
});

// ──────────────────────────────────────────────────────────────
// 📤 Export Router
// ──────────────────────────────────────────────────────────────
module.exports = authRouter;
