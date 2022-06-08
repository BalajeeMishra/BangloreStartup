const User = require("../models/user");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
// req.session.token yaha problem create kar raha hai check karo iska documentation.
module.exports.isVerified = async (req, res, next) => {
  const { token } = req.session;
  var user = await User.findOne({ token });
  if (user.verify) {
    // delete req.session.returnTo;
    next();
  } else {
    res.render("mail_verification", { mail_verify: false });
  }
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
