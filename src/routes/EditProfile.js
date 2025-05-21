// ═════════════════════════════════════════════════════════════════════════════
// 🔌 Import Required Modules
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const editRouter = express.Router();
const User = require("../models/user"); // Mongoose User model
const { validateEditData } = require("../Helpers/Validation"); // Custom validation function

// ═════════════════════════════════════════════════════════════════════════════
// ✏️ Route: PUT /edit/:userId
// Purpose: Update user profile information
// ═════════════════════════════════════════════════════════════════════════════
editRouter.put("/edit/:userId", async (req, res) => {
  const userId = req.params.userId.trim(); // Get and sanitize userId from params
  const updateData = req.body; // Incoming data to update

  try {
    // 🔍 Fetch the existing user by ID
    const existingUser = await User.findById(userId);

    // ✅ Validate the update data using a helper function
    validateEditData(existingUser, updateData);

    // 🔧 Update user document and return the updated one
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
    });

    // ✅ Respond with updated user data
    return res.status(200).send(updatedUser);
  } catch (error) {
    // ❌ Handle and return server-side errors
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 🚀 Export the Router
// ═════════════════════════════════════════════════════════════════════════════
module.exports = editRouter;
