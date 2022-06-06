const mongoose = require("mongoose");
const DetailOfWebinarSchema = new mongoose.Schema({
  nameofdepartment: {
    type: String,
  },
});
module.exports = mongoose.model("Department", DetailOfWebinarSchema);
