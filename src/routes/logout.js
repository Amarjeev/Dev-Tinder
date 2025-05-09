const express = require("express");
const { now } = require("mongoose");
const Accountlogout = express.Router();

Accountlogout.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(0),
  });
  res.send("Logout Successful!!!!");
});

module.exports = Accountlogout;
