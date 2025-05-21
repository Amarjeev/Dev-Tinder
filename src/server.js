require('dotenv').config(); // Load environment variables at the very beginning

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const connectDB = require("./config/database");
const cors = require('cors');

// Import route modules with clear descriptive names
const authRouter = require("./routes/authentication");
const editProfileRouter = require("./routes/EditProfile");
const userProfileRouter = require("./routes/userProfile");
const logoutRouter = require("./routes/logout");
const forgotPasswordRouter = require("./routes/forgotPassword");
// const friendRequestRouter = require("./routes/requests");
// const feedRequestRouter = require("./routes/reqfeed");
const feedRouter = require("./routes/feed");
const connectionRequestRouter = require("./routes/ConnectionRequest");

const app = express();
const PORT = 5000;

// ───────────── Middleware Setup ─────────────
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ───────────── Route Handlers ─────────────
app.use("/", authRouter);
app.use("/", userProfileRouter);
app.use("/", logoutRouter);
app.use("/", forgotPasswordRouter);
// app.use("/", friendRequestRouter);
// app.use("/", feedRequestRouter);
app.use("/", feedRouter);
app.use("/", connectionRequestRouter);
app.use("/", editProfileRouter);

// ───────────── Connect to Database and Start Server ─────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
});
