const express = require("express");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");
const Email = require("../models/newsLetter");
const { timingFormat } = require("../helper/date");
// /admin/lead
router.get("/monthlynews", async (req, res) => {
  const email = await Email.find({});
  const dateNow = timingFormat(new Date());
  const { month, year } = dateNow;
  const firstDayOfMonth = year + "-" + month + "-" + "01";
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
  // subscribed user this month.
  const subscribedUser = await TransactionDetail.find({
    date: { $in: newList },
  });
  res.send(subscribedUser.length);
});

module.exports = router;
