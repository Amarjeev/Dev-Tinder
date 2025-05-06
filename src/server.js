const express = require("express");
const bcrypt = require("bcrypt");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./Helpers/Validation");

const app = express();
const PORT = 5000;

app.use(express.json());

/**
 * POST: Create a new user
 */
app.post("/signup", async (req, res) => {
  const { name, email, age, gender, password } = req.body;

  try {
    validateSignupData(req);

    // Hash the password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      age,
      gender,
      password: passwordHash,
    });

    await user.save();

    console.log("Hashed Password:", passwordHash);
    res.status(201).send("User added successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * POST: Login account
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).send("Please enter a valid email address.");
    }

    const isPasswordMatch = await bcrypt.compare(password, userData.password);

    if (isPasswordMatch) {
      res.status(200).send("Login successful.");
    } else {
      res.status(400).send("Wrong password.");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * GET: Find user by email
 */
app.get("/user", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.find({ email });

    if (!user.length) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
});

/**
 * GET: Get all users
 */
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
});

/**
 * PUT: Update user by ID
 */
app.put("/update/:userId", async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      return res.status(400).send("Email cannot be changed once set.");
    }

    const age = Number(updateData.age);
    if (isNaN(age)) {
      return res.status(400).send("Please enter a numeric age.");
    }

    if (age < 0 || age > 120) {
      return res.status(400).send("Please enter a valid age between 0 and 120.");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Update failed.");
  }
});

/**
 * DELETE: Delete user by hardcoded ID
 */
app.delete("/delete", async (req, res) => {
  const id = "6815ccdb4643cf04643b32cd"; // Replace with dynamic ID in real app

  try {
    await User.findByIdAndDelete(id);
    res.status(200).send("Deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Delete failed.");
  }
});

/**
 * Connect to database and start server
 */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
});
 