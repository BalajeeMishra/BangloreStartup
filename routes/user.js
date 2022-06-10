const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const {
  mailForVerify,
  mailForForgetpassword,
} = require("../helper/mailsendingfunction");

// register form route
router.get(
  "/register",
  wrapAsync(async (req, res, next) => {
    res.render("register");
  })
);

// registering the user.
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
        company,
        jobtitle,
      } = req.body;

      const userData = req.body;
      if (password != password2) {
        return res.render("register", {
          userData,
          match: true,
        });
      }
      if (password.length < 8) {
        return res.render("register", { userData });
      }
      // we have to think here.
      req.session.token = jwt.sign(
        { firstname, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "2m" }
      );
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
      const registeredUser = await User.register(user, password);
      req.session.ids = registeredUser._id || null;
      if (typeof registeredUser != "undefined") {
        const result = await mailForVerify(email, req.session.token);
        // result ko bhi check karna hai.
        if (result.accepted[0]) {
          return res.render("mail_verification");
        }
      }
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/user/register");
    }
  })
);

//login form route.
router.get(
  "/login",
  wrapAsync(async (req, res, next) => {
    res.render("login");
  })
);
//logging the user.
router.post(
  "/login",
  async (req, res, next) => {
    const { email } = req.body;
    var user = await User.findOne({ email });
    if (!user) {
      return new AppError("user not found,please enter the detail carefully");
    }
    if (user.verify) {
      next();
    } else if (!user.verify) {
      req.flash("error", "Please first verify yourself");
      return res.redirect("/user/login");
    }
  },
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
    successFlash: true,
    successRedirect: "/",
  })
);

// Token verification route after user registeration for verify to be true...
router.get(
  "/login/:id",
  wrapAsync(async (req, res, next) => {
    console.log(await User.findOne({ token: req.session.token }));
    const id = req.params.id;
    if (id === req.session.token) {
      console.log("balajee mishra");
      const user = await User.findOneAndUpdate(
        { token: req.session.token },
        { verify: true },
        {
          new: true,
        }
      );
      console.log(user);
      // User.findOneAndUpdate(
      //   req.session.token,
      //   { verify: true },
      //   { upsert: true },
      //   function (err, doc) {
      //     if (err) return res.send(500, { error: err });
      //   }
      // ).then((doc) => console.log(doc));
      // await User.findOneAndUpdate(
      //   id,
      //   { //$unset: { token: 1 } },
      //   { useFindAndModify: false }
      // );
      //iske thora check karna hai....
      // delete req.session.token;
      req.flash("success", "YOU ARE VERIFIED NOW");
      return res.redirect("/user/login");
    }
  })
);
// forget password route page taking user email.
router.get(
  "/forgetpassword",
  wrapAsync(async (req, res, next) => {
    res.render("forgetpassword");
  })
);
// taking registered email for sending verificational link to change password
router.post(
  "/forgetpassword",
  wrapAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      req.session.foremail = user;
      const { firstname } = user;
      const password = "etyu@!321";

      req.session.token1 = jwt.sign(
        { firstname, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "10m" }
      );
      //idhar result kuch unexpected bhi aa sakta hai kya.
      const result = await mailForForgetpassword(email, req.session.token1);
      console.log(result);
      if (result.accepted[0]) {
        return res.render("mail_verification", { mail_verify: true });
      } else {
        return new AppError("Something going wrong,Please try again later.");
      }
    } else {
      return new AppError("user not matched,please enter your mail carefully.");
    }
  })
);
// taking user input as password and confirm password for the user who will  forget their password.
router.get(
  "/detailforchange/:id",
  wrapAsync(async (req, res, next) => {
    const id = req.params.id;
    if (id === req.session.token1) {
      return res.render("detailforchangepassword");
    }
  })
);

//posting the entered password and changing the password for user.
router.post(
  "/detailforchange",
  wrapAsync(async (req, res, next) => {
    const { email } = req.session.foremail;
    const user = await User.findOne({ email });
    const { password, password2 } = req.body;
    const userData = req.body;
    if (password != password2) {
      return res.render("detailforchangepassword", {
        userData,
        match: true,
      });
    }
    if (password.length < 8) {
      return res.render("detailforchangepassword", {
        userData,
      });
    }

    user.setPassword(req.body.password, async (err, user) => {
      if (err) {
        throw new AppError("Something going wrong,please try again");
      }
      await user.save();
    });
    req.flash("success", "your password changed successfully");
    res.redirect("/user/login");
  })
);

//logging out route for user.
router.get(
  "/logout",
  wrapAsync(async (req, res, next) => {
    req.logout();
    req.flash("success", "Logged out!");
    return res.redirect("/user/login");
  })
);

module.exports = router;
