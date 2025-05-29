const mongoose = require("mongoose");

const dbConnect = async () => {
  await mongoose.connect(
    "mongodb+srv://abhishekbhade2005:BQBdClYm904VdYPB@cluster0.k3liyfg.mongodb.net/devConnect"
  );
};

module.exports = dbConnect;
