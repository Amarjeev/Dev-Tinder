const express = require("express");
const { now } = require("mongoose");
const Accountlogout = express.Router();

Accountlogout.post("/logout", (req, res) => {
  // const expirationTime = new Date(Date.now() + 5000); // 8 seconds = 8000 milliseconds

  res.cookie("token", null, {
    // expires:expirationTime
    expires: new Date(0),
  });
  
  res.send("Logout Successful!!!!");
});

module.exports = Accountlogout;
