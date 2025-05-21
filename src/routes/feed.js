// ═════════════════════════════════════════════════════════════════════════════
// 📦 Required Module Imports
// ═════════════════════════════════════════════════════════════════════════════
const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// ═════════════════════════════════════════════════════════════════════════════
// 📁 Local Module Imports
// ═════════════════════════════════════════════════════════════════════════════
const User = require("../models/user"); // Mongoose model for user collection
const RequestModel = require("../RequestModel/connectionRequest"); // Model for managing connection requests

// ═════════════════════════════════════════════════════════════════════════════
// 🚀 Router Initialization
// ═════════════════════════════════════════════════════════════════════════════
const feedRoute = express.Router(); // Initialize a new Express Router

// ═════════════════════════════════════════════════════════════════════════════
// 📍 Route: GET /alluser/:userId
// 📄 Description:
//   Retrieve all users excluding:
//   1️⃣ The current user
//   2️⃣ Users who are already in 'accepted' or 'interested' connection states
// ═════════════════════════════════════════════════════════════════════════════
feedRoute.get("/alluser/:userId", async (req, res) => {
  try {
    // 🧠 Step 1: Extract userId from URL params and convert to ObjectId
    const userId = req.params.userId;
    const objectId = new ObjectId(userId);

    // 🔍 Step 2: Find all connection requests where the user is involved
    const response = await RequestModel.find({
      $or: [
        { fromUserId: objectId },
        { toUserId: objectId }
      ],
      status: { $in: ['accepted', 'interested'] }
    }).select("fromUserId toUserId fromUserName toUserName status");

    // 🧾 Step 3: Flatten all user IDs involved in those requests
    const userIdsInRequests = response.flatMap(doc => [
      doc.fromUserId.toString(),
      doc.toUserId.toString()
    ]);

    // 📦 Step 4: Fetch all users excluding the current user and users in requests
    const alluserData = await User.find({
      _id: { $nin: [objectId, ...userIdsInRequests] }
    });

    // ✅ Step 5: Send successful response with filtered users
    res.status(200).send({ alluserData });

  } catch (error) {
    // ❌ Error Handling
    console.error("❌ Error fetching users:", error);
    res.status(500).send({ error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 📤 Export the Router
// ═════════════════════════════════════════════════════════════════════════════
module.exports = feedRoute;
