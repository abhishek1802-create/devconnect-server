const express = require("express");
const User = require("../Models/user");
const {
  validateRegisterData,
  validateLoginData,
} = require("../utils/Validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // validate the request data
    validateRegisterData(req);

    // Encrypt the password
    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    await user.save();
    res.status(201).send({
      message: "user signup successful",
      user,
    });
  } catch (e) {
    res.status(401).send("Error: " + e.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate the Email
    validateLoginData(req);

    //Check Email exists or not
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    // check the password
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token);
      res.status(200).send({
        message: "Login Successful",
        user,
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (e) {
    res.status(401).send("Error: " + e.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("User logout successfully");
});
module.exports = authRouter;
