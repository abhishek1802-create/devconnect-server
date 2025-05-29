const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;

    if (!token) {
      return res.status(401).send("Token is not valid");
    }

    //verify the token
    const decodedObj = await jwt.verify(token, "Dev@Connect00");

    const { _id } = decodedObj;
    const user = await User.findById({ _id });
    req.user = user;
    next();
  } catch (e) {
    res.send("Error: " + e);
  }
};

module.exports = {
  userAuth,
};
