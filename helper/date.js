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
  var str = 0;
  if (a == 00) {
    str = 12 + ":" + b + " AM";
  }
  if (a < 12 && a != 00) {
    str = a + ":" + b + " AM";
  }
  if (a == 12) {
    str = a + ":" + b + " PM";
  }
  if (a > 12 && a != 12) {
    str = a - 12 + ":" + b + " PM";
  }
  console.log(str);
};
