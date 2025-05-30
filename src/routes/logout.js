// ═════════════════════════════════════════════════════════════════════════════
// 🔌 Import Required Modules
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const Accountlogout = express.Router();

// ═════════════════════════════════════════════════════════════════════════════
// 🔓 Route: POST /logout
// Purpose: Clear the authentication cookie and log the user out
// ═════════════════════════════════════════════════════════════════════════════
Accountlogout.post("/logout", (req, res) => {
  // 🗓️ Optional: Set a short expiration if needed
  // const expirationTime = new Date(Date.now() + 8000); // 8 seconds (example)

  // ❌ Clear the cookie by setting its expiration in the past
  res.cookie("token", null, {
    expires: new Date(0), // Clears the cookie immediately
    httpOnly: true,       // Recommended for security
    secure: true,         // Set to true in production with HTTPS
    sameSite: "strict",   // Prevent CSRF
  });

  // ✅ Respond with success message
  res.send("Logout Successful!!!!");
});

// ═════════════════════════════════════════════════════════════════════════════
// 🚀 Export the Router
// ═════════════════════════════════════════════════════════════════════════════
module.exports = Accountlogout;
