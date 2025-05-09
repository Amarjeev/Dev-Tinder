const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const editRoutes = require("./routes/edit");
const deleteRoutes = require("./routes/delete");
const logoutRoutes = require("./routes/logout");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const reqIntrestedRoutes = require('./routes/reqIntereted');



const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", editRoutes);
app.use("/", deleteRoutes);
app.use("/", logoutRoutes);
app.use("/", forgotPasswordRoutes);
app.use("/", reqIntrestedRoutes); 



// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
});
