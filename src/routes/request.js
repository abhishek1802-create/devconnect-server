const express = require("express");
const ConnectionRequest = require("../Models/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const User = require("../Models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User does not exist" });
      }
      console.log("from user id: " + fromUserId);
      console.log("to user id: " + toUserId);

      if (fromUserId.toString() === toUserId.toString()) {
        return res
          .status(400)
          .json({ message: "Cannot send request to yourself" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { formUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} is ${toUser.firstName}`,
        data,
      });
    } catch (e) {
      res.status(400).send("Error: " + e.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        fromUserId: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      console.log("connectionRequest: ", connectionRequest);

      if (!connectionRequest) {
        return res.status(400).send("Connection request not found");
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.status(200).json({ message: `Connection request ${status}`, data });
    } catch (e) {
      res.status(400).send("Error: " + e);
    }
  }
);

module.exports = requestRouter;
