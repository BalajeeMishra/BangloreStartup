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
