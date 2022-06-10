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
  pdf_path: {
    type: String,
    default: "",
  },
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  //required timestamp thing,
});

module.exports = mongoose.model("webinarDetail", DetailOfWebinarSchema);
