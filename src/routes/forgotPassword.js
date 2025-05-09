const express = require("express");
const forPassword = express.Router();
const User = require("../models/user");

forPassword.put("/profile/password", async (req, res) => {
  const { email, password, age } = req.body;
  try {
    const userdata = await User.findOneAndUpdate({ email }, { age });

    res.send([email, password, age]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = forPassword;
