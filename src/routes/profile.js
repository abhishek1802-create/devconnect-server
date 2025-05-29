const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/Validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send({
      message: "profile data fetched successfully",
      user: user,
    });
  } catch (e) {
    res.status(401).send("Error: " + e.message);
  }
});

profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.status(200).send({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      user: loggedInUser,
    });
  } catch (e) {
    res.status(401).send("Error: " + e);
  }
});

profileRouter.patch("password/edit", userAuth, (req, res) => {});

profileRouter.patch("profile/pic/edit", userAuth, async (req, res) => {});

module.exports = profileRouter;
