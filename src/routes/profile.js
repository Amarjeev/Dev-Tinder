const express = require("express");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const UserData = req.userData;
    res.status(200).send(UserData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = profileRouter;
