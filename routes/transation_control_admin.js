// this page is just for all the control of admin on transaction.
const express = require("express");
const router = express.Router();
const TransactionDetail = require("../models/transaction");
// /transactiondetail
router.get("/", async (req, res) => {
  const transactionDetail = await TransactionDetail.find({});
  // console.log("balajee mishra", transactionDetail[0].createdAt);
  // db.transactiondetails.insertMany([
  //   {
  //     amount: 500,
  //     time: "01-06-2022",
  //   },
  //   {
  //     amount: 500,
  //     time: "02-06-2022",
  //   },
  //   {
  //     amount: 500,
  //     time: "03-06-2022",
  //   },
  // ]);
  res.send(transactionDetail);
});
// db.products.insertMany([
//   { item: "card", qty: 15 },
//   { item: "envelope", qty: 20 },
//   { item: "stamps", qty: 30 },
// ]);
module.exports = router;
