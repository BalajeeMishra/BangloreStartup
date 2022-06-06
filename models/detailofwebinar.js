const mongoose = require("mongoose");

const DetailOfWebinarSchema = new mongoose.Schema({
  advantageous: {
    type: String,
  },
  aboutopic: {
    type: String,
  },
  bestfor: {
    type: String,
  },
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  //required timestamp thing,
});

module.exports = mongoose.model("webinarDetail", DetailOfWebinarSchema);
