const express = require("express");
const feedRoute = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const { ObjectId } = require("mongodb");


feedRoute.get("/alluser/:userId",async (req, res) => {
  
  try {
    const userId = req.params.userId;
    const objectId = new ObjectId(userId);
    console.log(objectId)
    const alluserData = await User.find({_id:{$ne:objectId}});
    res.status(200).send({ alluserData });
    console.log("all user data fetching done");
  } catch (error) {
  console.error('Error fetching users:', error);
  res.status(500).send({ error: error.message });
}

});


module.exports = feedRoute;
