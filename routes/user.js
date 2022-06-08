const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const { isVerified } = require("../helper/middleware");
const {
  mailForVerify,
  mailForForgetpassword,
} = require("../helper/mailsendingfunction");

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
      // we have to think here.
      req.session.token = jwt.sign(
        { firstname, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "10m" }
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

      const registeredUser = await User.register(user, password).catch((e) =>
        next(e)
      );
      req.session.ids = registeredUser._id || null;
      if (typeof registeredUser != "undefined") {
        const result = await mailForVerify(email, req.session.token);
        // result ko bhi check karna hai.
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
  console.log(req.session.token);
  const id = req.params.id;
  if (id === req.session.token) {
    User.findOneAndUpdate(
      req.session.token,
      { verify: true },
      { upsert: true },
      function (err, doc) {
        if (err) return res.send(500, { error: err });
      }
    ).then((doc) => console.log(doc));
    // await User.findOneAndUpdate(
    //   id,
    //   { //$unset: { token: 1 } },
    //   { useFindAndModify: false }
    // );
    //iske thora check karna hai....
    // delete req.session.token;
    req.flash("success", "YOU ARE VERIFIED NOW");
    return res.redirect("/");
  }
});
// forget password route.
router.get("/forgetpassword", async (req, res) => {
  res.render("forgetpassword");
});
// taking registered email for sending verificational link to change password
router.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  req.session.foremail = user;
  const { firstname } = user;
  const password = "etyu@!321";
  if (user) {
    req.session.token1 = jwt.sign(
      { firstname, email, password },
      process.env.JWT_ACC_ACTIVATE,
      { expiresIn: "10m" }
    );
    //idhar result kuch unexpected bhi aa sakta hai kya.
    const result = await mailForForgetpassword(email, req.session.token1);

    if (result) {
      return res.render("mail_verification", { mail_sent: true });
    }
  }
});
router.get("/detailforchange/:id", async (req, res) => {
  const id = req.params.id;
  if (id === req.session.token1) {
    return res.render("detailforchangepassword");
  }
});
router.post("/detailforchange", async (req, res) => {
  const { email } = req.session.foremail;
  const user = await User.findOne({ email });
  const change = await user.setPassword(req.body.password);
  req.flash("success", "your password changed successfully");
  res.redirect("/user/login");
});
router.get("/logout", async (req, res) => {
  req.logout((e) => console.log(e));
  req.flash("success", "You have logged out successfully!");
  res.redirect("/user/login");
});

module.exports = router;
