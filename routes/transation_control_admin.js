// this page is just for all the control of admin on transaction.
const express = require("express");
const router = express.Router();
const TransactionDetail = require("../models/transaction");
const { transactionWeekFormat, timingFormat } = require("../helper/date");
// /transactiondetail
router.get("/", async (req, res) => {
  const dateNow = timingFormat(new Date());
  const dateformat = transactionWeekFormat();
  const storingPurposeData = timingFormat(dateformat[0]);
  var getDaysArray = function (start, end) {
    for (
      var arr = [], dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    return arr;
  };
  var daylist = getDaysArray(
    new Date(storingPurposeData.datePattern),
    new Date()
  );
  const newList = daylist.map((e) => {
    return timingFormat(e).dateformattransaction;
  });
  newList.push(dateNow.dateformattransaction);
  console.log("hello", newList);
  const transactionDetail = await TransactionDetail.find({
    date: { $in: newList },
  });

  // console.log(storingPurposeData.dateformattransaction);
  // dateformattransaction: '13-06-2022',
  // givenDate: '13'
  // console.log("balajee mishra", transactionDetail[0].createdAt);
  // db.transactiondetails.insertMany([
  //   {
  //     amount: 500,
  //     date: "13-06-2022",
  //   },
  //   {
  //     amount: 500,
  //     date: "14-06-2022",
  //   },
  //   {
  //     amount: 500,
  //     date: "13-06-2022",
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
