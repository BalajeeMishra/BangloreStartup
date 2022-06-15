const mongoose = require("mongoose")

const ContactFormSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  industry: String,
  message: String,
  contact_type: {
    type: String,
    default: "feedback",
  },
})

module.exports = mongoose.model("Contact", ContactFormSchema)
