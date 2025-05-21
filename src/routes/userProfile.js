// ═════════════════════════════════════════════════════════════════════════════
// 🔌 Import Required Modules
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const { userAuth } = require("../middlewares/auth"); // Middleware to verify user authentication
const userProfileRouter = express.Router();

// ═════════════════════════════════════════════════════════════════════════════
// 📄 Route: GET /profile
// Access: 🔒 Protected (requires authentication)
// Purpose: Retrieve the authenticated user's profile data
// ═════════════════════════════════════════════════════════════════════════════
userProfileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    // ✅ Get user data from the auth middleware
    const UserData = req.userData;

    // 📤 Send user data back as response
    res.status(200).send(UserData);
  } catch (error) {
    // ❌ Handle and report any server-side errors
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 🚀 Export the Router
// ═════════════════════════════════════════════════════════════════════════════
module.exports = userProfileRouter;
