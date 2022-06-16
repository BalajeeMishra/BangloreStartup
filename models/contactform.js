const mongoose = require("mongoose")
const ContactFormSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  message: {
    type: String,
  },
  date: {
    type: String,
  },
  contact_type: {
    type: String,
    default: "feedback",
  },
  industry: String,
  company: String,
})
module.exports = mongoose.model("Contact", ContactFormSchema)
