const mongoose = require("mongoose");
const TranscationDetailSchema = new mongoose.Schema({
  nameofpurchase: {
    type: String,
  },
  price: {
    type: Number,
  },
  order: {
    type: Number,
    unique: true,
    required: true,
  },
});
module.exports = mongoose.model("Purchase", TranScationDetailSchema);
