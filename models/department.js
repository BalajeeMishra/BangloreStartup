const mongoose = require("mongoose");
const DetailOfWebinarSchema = new mongoose.Schema({
  nameofdepartment: {
    type: String,
  },
  order: {
    type: Number,
    required: true,
    unique: true,
  },
});
module.exports = mongoose.model("Department", DetailOfWebinarSchema);
