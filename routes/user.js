const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const { isVerified } = require("../helper/middleware");
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
        company,
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
        next(e)
      );
      console.log("balajee mishra");
      console.log("register", registeredUser);
      req.session.ids = registeredUser._id || null;
      if (typeof registeredUser != "undefined") {
        const result = await mailForVerify(email, req.session.token);
        if (result) {
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
  "/login",
  isVerified,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
    successFlash: true,
    successRedirect: "/",
  })
);

// Token verification route...
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

router.get("/logout", async (req, res) => {
  req.logout((e) => console.log(e));
  req.flash("success", "You have logged out successfully!");
  res.redirect("/user/login");
});

module.exports = router;
