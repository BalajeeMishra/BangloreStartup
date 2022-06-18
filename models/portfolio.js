const mongoose = require("mongoose")

const PortfolioSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    url: {
      type: String,
      default:
        "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
    },
    filename: String,
  },
  qualification: {
    type: String,
  },
  designation: {
    type: String,
  },
  description: {
    type: String,
  },
  visible: {
    type: String,
  },
})

module.exports = mongoose.model("Portfolio", PortfolioSchema)
