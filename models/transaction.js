const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("TransactionDetail", TransactionSchema);
