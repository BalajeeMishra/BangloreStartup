const mongoose = require("mongoose");
const ContactFormSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  message: {
    type: String,
  },
  date: {
    type: String,
  },
});
module.exports = mongoose.model("Contact", ContactFormSchema);
