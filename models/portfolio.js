const mongoose = require("mongoose");
const PortfolioSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
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
});
module.exports = mongoose.model("Portfolio", PortfolioSchema);
