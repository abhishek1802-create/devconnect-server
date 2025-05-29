const express = require("express");
const dbConnect = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/users");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Include PATCH
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter, profileRouter, requestRouter, userRouter);

dbConnect()
  .then(() => {
    console.log("Database connection successful");
    app.listen(7777, () => {
      console.log("Server is listening at PORT 7777");
    });
  })
  .catch((e) => {
    console.log("Database connection failed" + e);
  });
