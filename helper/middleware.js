const User = require("../models/user");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin == true) {
    next();
  } else {
    req.flash("error", "Please log in as admin.");
    res.redirect("/user/login");
    // res.redirect('/users/login');
  }
};
