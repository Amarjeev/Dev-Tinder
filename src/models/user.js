const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Add this at the top

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 15,
      validate(value) {
        if (!/^[A-Za-z\s]+$/.test(value)) {
          throw new Error(
            "Name must not contain numbers or special characters"
          );
        }
      },
    },
    friendname: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (
          !/[a-z]/.test(value) ||
          !/[0-9]/.test(value) ||
          !/[!@#$%^&*(),.?":{}|<>]/.test(value)
        ) {
          throw new Error(
            "Password must include uppercase, lowercase, number, and special character"
          );
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      // immutable: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    age: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error("Invalid age");
        }
      },
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender must be 'male', 'female', or 'other'");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
       "https://static.vecteezy.com/system/resources/previews/036/594/092/original/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const userData = this;
  const token = jwt.sign({ _id: userData._id }, "DEVTINDER@123$", {
    expiresIn: "1d",
  });
  return token;
};
userSchema.methods.validatePassword = async function (
  comparepasswordInputUser
) {
  const user = this;
  const passwordHash = user.password;
  const passwordValid = await bcrypt.compare(
    comparepasswordInputUser,
    passwordHash
  );
  return passwordValid;
};

// Middleware to adjust 'updatedAt' to IST (UTC +5:30)
const applyISTOffset = function (next) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  this.set({ updatedAt: new Date(Date.now() + IST_OFFSET) });
  next();
};

userSchema.pre("update", applyISTOffset);
userSchema.pre("findOneAndUpdate", applyISTOffset);

const User = mongoose.model("User", userSchema);

module.exports = User;
