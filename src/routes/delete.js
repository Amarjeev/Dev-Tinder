const express = require("express");
const accountDeleted = express.Router();
const User = require("../models/user");

accountDeleted.delete("/Delete/:useruId", async (req, res) => {
  const userId = req.params.useruId.trim();
  try {
    await User.findByIdAndDelete(userId);
    res.status(200).send("Deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Delete failed.");
  }
});

module.exports = accountDeleted;
