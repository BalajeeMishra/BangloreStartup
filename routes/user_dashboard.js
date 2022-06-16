const express = require("express");
const User = require("../models/user");
const Cart = require("../models/cart");
const Email = require("../models/newsLetter");
const router = express.Router();
const wrapAsync = require("../controlError/wrapAsync.js");
const { AppError } = require("../controlError/AppError");
const { timingFormat } = require("../helper/date");
const user = require("../models/user");

// user dashboard
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const userdata = await User.findById(req.user._id);
    res.render("userdashboard/userdashboarddata", { userdata });
  })
);

//new added from here.
// adding new user for newsLetter.
router.post(
  "/addnewuser",
  wrapAsync(async (req, res) => {
    const { email } = req.body;
    const dateNow = timingFormat(new Date());
    const newUser = new Email({
      email: email,
      date: dateNow.dateformattransaction,
    });
    await newUser.save();
    if (!newUser) {
      throw new AppError("Something going wrong", 404);
    }
    req.flash("success", "Thanks for subscribing our news letter.");
    return res.redirect("/");
  })
);

// route if someone will unsubscribe us.
router.post(
  "/unsubscribe",
  wrapAsync(async (req, res) => {
    const { email } = req.body;
    const userforunsubscribe = await Email.findOne({ email: email });
    userforunsubscribe.subscribed = false;
    await userforunsubscribe.save();
    if (!userforunsubscribe) {
      throw new AppError("Something going wrong,please try again.", 404);
    }
    req.flash("error", "you won't get any mails anymore.");
    return res.redirect("/");
  })
);

module.exports = router;
