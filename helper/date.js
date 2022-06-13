module.exports.timingFormat = (webinartiming) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  var date = new Date(webinartiming);
  var year = date.getFullYear();
  const monthname = monthNames[date.getMonth()];
  let day = weekday[date.getDay()];
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var givenDate = String(date.getDate()).padStart(2, "0");
  var givenDateShowpage = givenDate + "/" + monthname + "/" + year + "-" + day;
  var datePattern = year + "-" + month + "-" + givenDate;
  var dateformattransaction = givenDate + "-" + month + "-" + year;
  const formats = {
    givenDateShowpage,
    datePattern,
    dateformattransaction,
  };
  return formats;
};
module.exports.addtimeinAmPmFormat = (timing) => {
  var [a, b] = timing.split(":");
  var eastern = 0; // apna wala hai.
  var pacific = 0;
  if (a == 00) {
    pacific = 9 + ":" + parseInt(b) + " PM";
    eastern = 12 + ":" + parseInt(b) + " AM";
  }
  if (a == 3) {
    pacific = 12 + ":" + parseInt(b) + " AM";
  }

  if (a < 12 && a > 3) {
    pacific = parseInt(a) - 3 + ":" + parseInt(b) + " AM";
  }
  if (a > 00 && a < 3) {
    pacific = 21 + parseInt(a) + ":" + parseInt(b) + " PM";
  }

  if (a < 12 && a != 00) {
    eastern = a + ":" + parseInt(b) + " AM";
  }
  if (a == 12) {
    eastern = parseInt(a) + ":" + parseInt(b) + " PM";
    pacific = 9 + ":" + parseInt(b) + " AM";
  }
  if (a == 15) {
    pacific = 12 + ":" + parseInt(b) + " PM";
  }
  if (a > 12 && a < 15) {
    pacific = parseInt(a) - 3 + ":" + parseInt(b) + " AM";
  }
  if (a > 15) {
    pacific = parseInt(a) - 15 + ":" + parseInt(b) + " PM";
  }
  if (a > 12) {
    eastern = parseInt(a) - 12 + ":" + parseInt(b) + " PM";
  }
  const eastern_pacific = {
    eastern,
    pacific,
  };
  // console.log("check it now", eastern_pacific);
  return eastern_pacific;
};

module.exports.transactionWeekFormat = (req, res, next) => {
  const weekday = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
};
// tarik dekho then uska day  find karo then dekho ki uska indexing kya hai weekday me..
// jo bhi date hai na uske tarik me se  indexing hataonnn aur tab jo date aata hai waha se lekar
//now tak ka find karke dekho whi week hoga.....
