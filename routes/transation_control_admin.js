// this page is just for all the control of admin on transaction.
const express = require("express");
const router = express.Router();
const TransactionDetail = require("../models/transaction");
const { transactionWeekFormat, timingFormat } = require("../helper/date");
// /transactiondetail of every weekkkk they can check itt okay.
router.get("/weekly", async (req, res) => {
  //below line will give us the date of now.
  const dateNow = timingFormat(new Date());
  // basically below line will give us the monday and sunday of this week.
  const dateformat = transactionWeekFormat();
  //then passsing it inside other function for getting exact date of monday.
  const storingPurposeData = timingFormat(dateformat[0]);
  // bellow function will give the date between two date.
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
  // here as a parameter i am passing the date in datePattern of timingFormat function
  var daylist = getDaysArray(
    new Date(storingPurposeData.datePattern),
    new Date()
  );
  // again passing the found date inside map function for getting the date like 10-03-2022.
  const newList = daylist.map((e) => {
    return timingFormat(e).dateformattransaction;
  });
  // pushing last date inside newList.
  newList.push(dateNow.dateformattransaction);

  //finding TransactionDetail data with given date.
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

// 2022-06-14
router.get("/monthly", async (req, res) => {
  const dateNow = timingFormat(new Date());
  const { month, year } = dateNow;
  const firstDayOfMonth = year + "-" + month + "-" + "01";
  // bellow function will give the date between two date.
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
  // here as a parameter i am passing the date in datePattern of timingFormat function
  var dayList = getDaysArray(new Date(firstDayOfMonth), new Date());
  // again passing the found date inside map function for getting the date like 10-03-2022.
  const newList = dayList.map((e) => {
    return timingFormat(e).dateformattransaction;
  });
  // pushing last date inside newList(we have weekly data here).
  newList.push(dateNow.dateformattransaction);

  //finding TransactionDetail data with given date(we have monthly data here).
  const transactionDetail = await TransactionDetail.find({
    date: { $in: newList },
  });
  res.send(transactionDetail);
});

module.exports = router;
