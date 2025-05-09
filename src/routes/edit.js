const express = require("express");
const editRouter = express.Router();
const User = require("../models/user");
const { validateEditData } = require("../Helpers/Validation");

editRouter.put("/edit/:userId", async (req, res) => {
  const userId = req.params.userId.trim();
  const updateData = req.body;

  try {
    //   validateSignupData(updateData)
    const existingUser = await User.findById(userId);
    validateEditData(existingUser, updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = editRouter;
