const express = require("express");
const friendslistRouter = express.Router();
const User = require("../models/user"); // 👤 Mongoose model for the 'User' collection
const RequestModel = require("../RequestModel/connectionRequest"); // 🔗 Model for connection/friend requests
const mongoose = require("mongoose");

// 📥 GET /friendslist/:loginUserId
// 🎯 Purpose: Get all accepted friends of the user with ID :loginUserId
friendslistRouter.get("/friendslist/:loginUserId", async (req, res) => {
  const { loginUserId } = req.params;

  // 🛡️ Step 1: Validate the user ID format
  if (!mongoose.Types.ObjectId.isValid(loginUserId)) {
    return res.status(400).json({ error: "❌ Invalid User ID format" });
  }

  try {
    const userId = new mongoose.Types.ObjectId(loginUserId); // 🧾 Convert string to ObjectId
    console.log("🔍 Fetching friends for user:", userId);

    // 🔎 Step 2: Fetch all accepted connection requests involving the user
    const response = await RequestModel.find({
      status: "accepted",
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    // 🧠 Step 3: Extract the IDs of the user's friends
    const friendIds = response
      .map((request) => {
        // 🧍 Ignore the login user's ID and return the friend's ID
        if (request.fromUserId?.toString() === userId.toString()) {
          return request.toUserId;
        } else {
          return request.fromUserId;
        }
      })
      .filter(Boolean); // 🚿 Remove any undefined/null entries

    // 📚 Step 4: Fetch user details of friends
    const userData = await User.find({ _id: { $in: friendIds } }).select(
      "_id name photoUrl"
    );

    // 📤 Step 5: Send the friend list to the client
    res.status(200).json(userData);
  } catch (error) {
    console.error("💥 Error fetching friends list:", error);
    res.status(500).json({ error: "🚨 Internal Server Error" });
  }
});

module.exports = friendslistRouter;
