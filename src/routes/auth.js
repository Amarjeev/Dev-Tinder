const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignupData } = require("../Helpers/Validation");

const authRouter = express.Router();

// POST /signup - Register a new user
authRouter.post("/signup", async (req, res) => {
  const { name, email, age, gender, password, photoUrl } = req.body;

  try {
    //checking this email already in db
   const existingUser = await User.findOne({ email });
    
   if (existingUser) {
  return res
    .status(400)
    .json({ message: 'Email is already registered. Please use another email address.' });
}



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
      photoUrl,
      password: passwordHash,
    });

    await user.save();
    console.log("working signup");
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
      console.error("wrong email address");
      return res.status(400).json({ emailerror: "Invalid email or password" });
    }

    // Validate password
    const isPasswordMatch = await userData.validatePassword(password);

    if (!isPasswordMatch) {
      console.error("wrong passworde ");
      return res.status(400).json({ emailerror: "Invalid email or password" });
    }

    // Generate JWT token
    const token = await userData.getJWT();

    // Set token in cookie
    res.cookie("token", token, { httpOnly: true, secure: false });
    const userObj = userData.toObject();
    res.status(200).json({
      userObj,
      token: token,
    });

    res.status(200).send("Login successful.");
    console.log("frontend api is working");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = authRouter;
