const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("token not valid!!!!!!!!!!");
    }
    const decodeMessage = await jwt.verify(token, "DEVTINDER@123$");
    const { _id } = decodeMessage;
    const userData = await User.findById(_id);
    if (!userData) {
      throw new Error("User not found");
      }
      req.userData = userData;
    next();
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { userAuth };
