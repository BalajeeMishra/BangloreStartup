const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({});
module.exports = mongoose.model("TransactionDetail", TransactionSchema);
