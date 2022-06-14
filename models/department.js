const mongoose = require("mongoose");
const DetailOfWebinarSchema = new mongoose.Schema({
  nameofdepartment: {
    type: String,
  },
  order: {
    type: Number,
    required: true,
  },
  visibility: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Department", DetailOfWebinarSchema);
