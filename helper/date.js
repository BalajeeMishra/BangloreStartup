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
  const formats = {
    givenDateShowpage,
    datePattern,
  };
  return formats;
};
module.exports.addtimeinAmPmFormat = (timing) => {
  var [a, b] = timing.split(":");
  console.log(timing);
  var eastern = 0; // apna wala hai.
  var pacific = 0;
  if (a == 00) {
    pacific = 9 + ":" + b + " PM";
    eastern = 12 + ":" + b + " AM";
  }
  if (a == 3) {
    pacific = 12 + ":" + b + " AM";
  }

  if (a < 12 && a > 3) {
    pacific = a - 3 + ":" + b + " AM";
  }
  if (a > 00 && a < 3) {
    pacific = 21 + a + ":" + b + " PM";
  }

  if (a < 12 && a != 00) {
    eastern = a + ":" + b + " AM";
  }
  if (a == 12) {
    eastern = a + ":" + b + " PM";
    pacific = 9 + ":" + b + " AM";
  }
  if (a == 15) {
    pacific = 12 + ":" + b + " PM";
  }
  if (a > 12 && a < 15) {
    pacific = a - 3 + ":" + b + " AM";
  }
  if (a > 15) {
    pacific = a - 3 + ":" + b + " PM";
  }
  if (a > 12) {
    eastern = a - 12 + ":" + b + " PM";
  }
  const eastern_pacific = {
    eastern,
    pacific,
  };
  console.log("check it now", eastern_pacific);
  return eastern_pacific;
};
