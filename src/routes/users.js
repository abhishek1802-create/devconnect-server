const express = require("express");
const ConnectionRequest = require("../Models/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const user = require("../Models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConnectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "about"]);

    const allConnectionData = allConnectionRequests.map(
      (connection) => connection.fromUserId
    );

    res.status(200).json({
      message: "Request fetched Successfully",
      requests: allConnectionData,
    });
  } catch (e) {
    res.status(400).send("Error: " + e);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const loggedInUserIdStr = loggedInUser._id.toString();

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "age",
        "skills",
        "gender",
        "about",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "age",
        "skills",
        "gender",
        "about",
      ]);

    const data = connections.map((connection) => {
      const fromId = connection.fromUserId._id.toString();
      const toId = connection.toUserId._id.toString();

      if (fromId === loggedInUserIdStr) {
        return connection.toUserId;
      } else {
        return connection.fromUserId;
      }
    });

    res.status(200).send({
      message: "Connections fetched successfully",
      connections: data,
    });
  } catch (e) {
    console.log("Error: " + e);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    // User should see all the cards except
    // 0. his own card
    // 1. his connections
    // 2. ignored peoples
    // 3. already sent the connection request

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString()),
        hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await user
      .find({
        $and: [
          { _id: { $nin: Array.from(hideUsersFromFeed) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
      .skip(skip)
      .limit(limit);

    res.status(200).send({
      message: "Feed cards fetched successfully",
      users: users,
    });
  } catch (e) {
    console.log("Error: " + e);
  }
});
module.exports = userRouter;
