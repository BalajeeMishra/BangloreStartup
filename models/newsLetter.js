const mongoose = require("mongoose");
const EmailSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  date: {
    type: String,
  },
  // new added
  subscribed: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("Email", EmailSchema);
