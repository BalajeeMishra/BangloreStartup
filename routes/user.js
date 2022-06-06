const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const passport = require("passport");
const { isVerified } = require("../helper/middleware");
const jwt = require("jsonwebtoken");
const { mailForVerify } = require("../helper/mailsendingfunction");
router.get(
  "/register",
  wrapAsync(async (req, res, next) => {
    res.render("register");
  })
);

router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const {
        firstname,
        lastname,
        email,
        password,
        password2,
        phone,
        address,
        cpmpany,
        jobtitle,
      } = req.body;
      console.log("balajee", req.body);
      const userData = req.body;
      if (password != password2) {
        // errors.push({ msg: 'Passwords do not match' });
        return res.render("register", {
          userData,
        });
      }
      if (password.length < 6) {
        return res.render("register", { userData });
      }
      req.session.token = jwt.sign(
        { firstname, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "1m" }
      );
      console.log("mishra", req.session.token);
      const user = new User({
        firstname,
        lastname,
        username: email,
        email,
        token: req.session.token,
        phone,
        address,
        company,
        jobtitle,
      });

      const registeredUser = await User.register(user, password).catch((e) =>
        console.log("unexpected Problem", e)
      );
      console.log("balajee mishra");
      console.log("register", registereduser);
      req.session.ids = registeredUser._id || null;
      if (typeof registeredUser != "undefined") {
        const result = await mailForVerify(email, req.session.token);
        if (result) {
          console.log(result);
          // return res.render("mail_verification", { mail_verify: true });
          return res.json({ mail_sent: true });
        }
      } else {
        return res.redirect("/user/register");
      }
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/user/register");
    }
  })
);
router.get("/login", async (req, res) => {
  res.render("login");
});

router.post(
  isVerified,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
    successFlash: true,
    successRedirect: "/",
  })
);
//token se ham find kar rahe hai .. yaha mail se bhi find kar sakte hai us case me agar token
//ko session me store karte hai to kya ye 20 minute ke ander me delete hoga thats question bro...
//okayyy.

// mujhe sikhna hoga how to delete session within 20 minutes or any specific time...
router.get("/login/:id", async (req, res) => {
  const id = req.params.id;
  if (id === req.session.token) {
    User.findOneAndUpdate(
      req.session.token,
      { verify: true },
      { upsert: true },
      function (err, doc) {
        if (err) return res.send(500, { error: err });
      }
    );
    await User.findOneAndUpdate(
      id,
      { $unset: { token: 1 } },
      { useFindAndModify: false }
    );
    //iske thora check karna hai....
    delete req.session.token;
    req.flash("success", "YOU ARE VERIFIED NOW");
    return res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You have Logged out successfully!");
  res.redirect("/login");
});

module.exports = router;
