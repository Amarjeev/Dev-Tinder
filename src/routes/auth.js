const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignupData } = require("../Helpers/Validation");

const authRouter = express.Router();

// POST /signup - Register a new user
authRouter.post("/signup", async (req, res) => {
  const { name, email, age, gender, password } = req.body;

  try {
    // Validate request data
    validateSignupData(req);

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create and save the user
    const user = new User({
      name,
      email,
      age,
      gender,
      password: passwordHash,
    });

    await user.save();
    res.status(201).send("User added successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// POST /login - Authenticate a user
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).send("Please enter a valid email address.");
    }

    // Validate password
    const isPasswordMatch = await userData.validatePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).send("Wrong password.");
    }

    // Generate JWT token
    const token = await userData.getJWT();

    // Set token in cookie
    res.cookie("token", token);
    res.status(200).send("Login successful.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = authRouter;
