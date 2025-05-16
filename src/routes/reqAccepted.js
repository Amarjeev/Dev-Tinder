const express = require("express");
const reqReview = express.Router();
const RequestModel = require("../RequestModel/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

reqReview.post(
  "/request/review/:status/:statustwo",
  userAuth,
  async (req, res) => {
    try {
      // Destructure parameters from the request
      const { status, statustwo: intereted } = req.params;
      const loginUserId = req.userData._id;

      // Validate the status parameter
      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status. Only "accepted" or "rejected" are allowed.',
        });
      }

      // Fetch the data from the database based on user ID and status
      const userData = await RequestModel.find({
        toUserId: loginUserId,
        
      });
      if (!userData || userData.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Update each matching document with "accepted" status
      for (const doc of userData) {
        await RequestModel.updateOne(
          { _id: doc._id },
          { $set: { status: "accepted" } }
        );
      }

      // Logging for debugging purposes
      console.log("Status:", status);
      console.log("Logged in User ID:", loginUserId);
      console.log("Fetched Data:", userData);

      // Send a success message (modify as needed for actual response)
      res.send("Review updated successfully.");
    } catch (error) {
      // Catch and log errors, returning a 500 response
      console.error("Error occurred:", error.message);
      return res.status(500).json({
        error: "An unexpected error occurred. Please try again later.",
      });
    }
  }
);

module.exports = reqReview;
