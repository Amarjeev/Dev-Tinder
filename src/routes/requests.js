const express = require("express");
const friendRequests = express.Router();
const RequestModel = require("../RequestModel/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

// Route to review friend requests based on status
friendRequests.get(
  "/request/review/:status/friendrequests",
  userAuth, // Middleware to authenticate user
  async (req, res) => {
    try {
      const userId = req.userData._id; // Get user ID from authenticated data
      const { status } = req.params; // Get status from request parameters

      // Define allowed statuses
      const allowedStatuses = ['interested'];

      // Check if the status is valid
      if (!allowedStatuses.includes(status)) {
        throw new Error('Status not valid');
      }

      // Query the database for friend requests with matching status and userId
      const userData = await RequestModel.find({ toUserId: userId, status: status })
        .populate('fromUserId', 'name email'); // Populate sender's data (name, email)
      
      // Log the data for debugging
      console.log(userData);
      
      // Send the response with the friend request data
      res.json(userData);
    } catch (error) {
      // Handle errors and send a response with a status code 500
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = friendRequests;
