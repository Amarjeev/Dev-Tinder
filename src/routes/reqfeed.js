const express = require("express");
const reqFeed = express.Router();
const RequestModel = require("../RequestModel/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

reqFeed.get("/feed/:status", userAuth, async (req, res) => {
  const userId = req.userData._id;
  const Username = req.userData.name;
  const status = req.params.status;

  const statusValue = ["interested", "rejected", "accepted"];
  try {
    if (!statusValue.includes(status)) {
      return res.status(400).send("status wrong");
    }

    const usersData = await RequestModel.find({
      $and: [
        {
          $or: [{ fromUserId: userId }],
        },
        { status: status },
      ],
    });

    // storing my friends _id
    const otherUserIds = usersData
      .map((req) => {
        if (req.fromUserId.toString() !== userId) {
          return req.toUserId;
        }
      })
      .filter(Boolean); // remove undefined values

    // collecting friends data
    const friendsDatas = await User.find(
      { _id: { $in: otherUserIds } },
      { name: 1, email: 1, age: 1, gender: 1, _id: 0 }
    );

    // adding message to friend's account
    if (status === "accepted") {
      const message = `${Username} is your new Facebook friend!`;
      for (const friendId of otherUserIds) {
        await User.findByIdAndUpdate(friendId, { friendname: message });
      }

      console.log("message adding success");
    }

    res.status(200).send({ friendProfile: friendsDatas });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = reqFeed;
