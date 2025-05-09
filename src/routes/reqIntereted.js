const express = require("express");
const RequestModel = require("../RequestModel/connectionRequest");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const receiverId = req.params.userId;
      const requestStatus = req.params.status;
        const senderId = req.userData._id;
        
      // Prevent a user from sending a request to themselves
      if (receiverId == senderId) {
        return res.status(400).json({
          error: "You cannot send a connection request to yourself.",
        });
      }

      // Validate request status
      if (requestStatus !== "interested") {
        return res.status(400).json({
          error: "Invalid request status. Only 'interested' status is allowed.",
        });
      }

      // Fetch user information
      const receiver = await User.findById(receiverId);
      const sender = await User.findById(senderId);

      // Prevent duplicate requests
      const existingDocument = await RequestModel.findOne({
        $or: [
          { fromUserId: senderId, toUserId: receiverId },
          { fromUserId: receiverId, toUserId: senderId },
        ],
      });

      if (existingDocument) {
        throw new Error("Request already exists.");
      }

      // Create new request document
      const newRequest = new RequestModel({
        fromUserId: senderId,
        toUserId: receiverId,
        status: requestStatus,
        fromUserName: sender.email,
        toUserName: receiver.email,
      });

      // Save new request to the database
      await newRequest.save();
      res.send(newRequest);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = requestRouter;
