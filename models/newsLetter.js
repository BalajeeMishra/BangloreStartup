const mongoose = require("mongoose");
const EmailSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  date: {
    type: String,
  },
});
module.exports = mongoose.model("Email", EmailSchema);