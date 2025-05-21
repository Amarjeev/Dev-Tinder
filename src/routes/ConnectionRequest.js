// ═════════════════════════════════════════════════════════════════════════════
// Module Imports
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const router = express.Router();
const RequestModel = require("../RequestModel/connectionRequest"); // Model for managing friend requests
const User = require("../models/user"); // User model
const { Axios } = require("axios"); // (Optional) HTTP client for future use
// const { userAuth } = require("../middlewares/auth"); // Uncomment if authentication is required

// ═════════════════════════════════════════════════════════════════════════════
// Route: POST /addfriend
// Purpose: Send a friend (connection) request
// ═════════════════════════════════════════════════════════════════════════════
router.post("/addfriend", async (req, res) => {
  try {
    const { fromUserId, status, toUserId } = req.body;

    // ❗ Prevent users from sending a request to themselves
    if (fromUserId === toUserId) {
      return res.status(400).json({
        error: "You cannot send a connection request to yourself.",
      });
    }

    // ❗ Only allow status "interested" for outgoing requests
    if (status !== "interested") {
      return res.status(400).json({
        error: "Invalid request status. Only 'interested' status is allowed.",
      });
    }

    // 🔍 Fetch both sender and receiver from the database
    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    // ❗ Check if both users exist
    if (!sender || !receiver) {
      return res.status(404).json({ error: "One or both users not found." });
    }

    // 🔍 Check for existing request between the two users (in either direction)
    const existingDocument = await RequestModel.findOne({
      $or: [
        { fromUserId: sender, toUserId: receiver },
        { fromUserId: receiver, toUserId: sender },
      ],
    });

    // ❗ If request already exists, do not create a duplicate
    if (existingDocument) {
      return res.status(404).json({ error: "Request already exists." });
    }

    // ✅ Create a new connection request
    const Request = new RequestModel({
      fromUserId,
      toUserId,
      status,
      fromUserName: sender.email,
      toUserName: receiver.email,
    });

    // 💾 Save request in the database
    await Request.save();

    // 📦 Respond with the saved request
    res.send(Request);
  } catch (error) {
    console.error("Error adding friend:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// Route: GET /currentStatus/:fromUserId
// Purpose: Get all "interested" requests sent by a user
// ═════════════════════════════════════════════════════════════════════════════
router.get("/currentStatus/:fromUserId", async (req, res) => {
  try {
    const { fromUserId } = req.params;

    // 🔍 Find all outgoing requests with status "interested"
    const currentStatus = await RequestModel.find({
      status: "interested",
      fromUserId,
    }).select("fromUserId toUserId status");

    // 📦 Send list to client
    res.status(200).json(currentStatus);
  } catch (error) {
    console.error("Error fetching current status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// Route: DELETE /cancelRequest
// Purpose: Cancel an already sent friend request
// ═════════════════════════════════════════════════════════════════════════════
router.delete("/cancelRequest", async (req, res) => {
  const { toUserId, loginUserId } = req.body;
  try {
    // ❌ Remove the friend request where the current user is the sender
    const response = await RequestModel.findOneAndDelete({
      fromUserId: loginUserId,
      toUserId,
    });

    // ❗ No matching request found
    if (!response) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // ✅ Successfully cancelled the request
    res.status(200).json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// Route: GET /FriendRequests/:loginUserId
// Purpose: Get all incoming "interested" requests for a user
// ═════════════════════════════════════════════════════════════════════════════
router.get("/FriendRequests/:loginUserId", async (req, res) => {
  try {
    const { loginUserId } = req.params;

    // ❗ Check if loginUserId is provided
    if (!loginUserId) {
      return res.status(400).json({ message: "UserId is empty" });
    }

    // 🔍 Fetch requests where current user is the receiver
    const response = await RequestModel.find({
      toUserId: loginUserId,
      status: "interested",
    }).populate("fromUserId"); // Include sender user details

    // 📦 Send the results to the client
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// Route: POST /friendRequests/Accept
// Purpose: Accept a received friend request
// ═════════════════════════════════════════════════════════════════════════════
router.post("/friendRequests/Accept", async (req, res) => {
  const { fromUserId } = req.body;

  // ❗ Validate required field
  if (!fromUserId) {
    return res
      .status(400)
      .json({ error: "fromUserId and toUserId are required" });
  }

  // 🔄 Update request status from "interested" to "accepted"
  const response = await RequestModel.findOneAndUpdate(
    { fromUserId, status: "interested" },
    { $set: { status: "accepted" } },
    { new: true } // Return the updated document
  );

  // ✅ Send success message and updated data
  res.status(200).json({ message: "Friend request accepted", data: response });
});

// ═════════════════════════════════════════════════════════════════════════════
// Export the router to be used in the main application
// ═════════════════════════════════════════════════════════════════════════════
module.exports = router;
