const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const router = express.Router()
const User = require("../models/user")
const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")
const {
  mailForVerify,
  mailForForgetpassword,
} = require("../helper/mailsendingfunction")
const { generateString } = require("../helper/string_generator")
const { verifyCaptcha } = require("../helper/middleware")

// register form route
router.get("/register", (_, res) => res.render("register"))

// registering the user.
router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const userData = ({
        firstname,
        lastname,
        email,
        password,
        password2,
        phone,
        address,
        company,
        jobtitle,
      } = req.body)
      // google captch validation
      verifyCaptcha(
        req,
        res
      )({ path: "register", detail: { userData, match: false } })
      if (password != password2) {
        return res.render("register", {
          userData,
          match: true,
        })
      }
      if (password.length < 8) {
        return res.render("register", { userData })
      }
      // storing token for verification purpose..
      req.session.token = jwt.sign(
        { firstname, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "24h" }
      )
      // below are the code for checking the expiry period of token
      var decoded = jwt.decode(req.session.token, { complete: true })
      const exp = decoded.payload.exp
      req.session.exp = exp
      // registering new user here.
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
      })
      const registeredUser = await User.register(user, password)
      req.session.ids = registeredUser._id || null
      if (registeredUser.verify) res.redirect("/login")
      if (typeof registeredUser != "undefined") {
        const result = await mailForVerify(email, req.session.token)
        // result ko bhi check karna hai.
        if (result.accepted[0]) {
          req.flash(
            "success",
            "We have sent a verification mail, please check your inbox."
          )
          return res.redirect("/login")
        }
      }
    } catch (e) {
      req.flash("error", e.message)
      return res.redirect("/user/register")
    }
  })
)

//login form route.
router.get(
  "/login",
  wrapAsync(async (req, res, next) => {
    res.render("login")
  })
)
//logging the user.
router.post(
  "/login",
  wrapAsync(async (req, res, next) => {
    const { email } = req.body
    var user = await User.findOne({ email })
    if (!user) {
      req.flash("error", "Please enter the detail carefully")
      return res.redirect("/user/login")
      // throw new AppError(
      //   "user not found,please enter the detail carefully",
      //   200
      // );
    }
    if (user.verify) {
      // req.flash("success", "welcome back");
      next()
    } else if (!user.verify) {
      req.flash("error", "Please first verify yourself")
      return res.redirect("/user/login")
    }
  }),
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
    successFlash: true,
    successRedirect: "/",
  })
)

// Token verification route after user registeration for verify to be true...
router.get(
  "/login/:id",
  wrapAsync(async (req, res, next) => {
    const id = req.params.id
    // checking if the token is expired;
    if (!req.session.exp) {
      return res.redirect("/user/sendthemailagain")
    }
    if (Date.now() >= req.session.exp * 1000) {
      delete req.session.token
      delete req.session.exp
      return res.redirect("/user/sendthemailagain")
    }
    if (id === req.session.token) {
      const user = await User.findOneAndUpdate(
        { token: req.session.token },
        { verify: true },
        {
          new: true,
        }
      )
      // deleting the token from the session after verification.
      delete req.session.token
      delete req.session.exp
      req.flash("success", "YOU ARE VERIFIED NOW")
      return res.redirect("/user/login")
    }
  })
)
// forget password route page taking user email.
router.get(
  "/forgetpassword",
  wrapAsync(async (req, res, next) => {
    res.render("forgetpassword")
  })
)
// taking registered email for sending verificational link to change password
router.post(
  "/forgetpassword",
  wrapAsync(async (req, res, next) => {
    const { email } = req.body
    req.session.foremail = email

    const user = await User.findOne({ email })
    if (!user) throw new AppError("Email not Registered", 400)
    if (user) {
      // all these things are used for generating token 1.
      const name = generateString(5)
      const email_fortoken = generateString(10)
      const password = generateString(8)
      // storing token for verification purpose..
      req.session.token = jwt.sign(
        { name, email_fortoken, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "24h" }
      )
      // below are the code for setting the expiry period of token1.
      var decoded = jwt.decode(req.session.token, { complete: true })
      const exp = decoded.payload.exp
      req.session.exp = exp

      //idhar result kuch unexpected bhi aa sakta hai kya.
      const result = await mailForForgetpassword(email, req.session.token)
      if (result.accepted[0]) {
        req.flash(
          "success",
          "We have sent a verification mail, please check your inbox."
        )
        return res.redirect("/forgetpassword")
      } else {
        return new AppError("Something going wrong,Please try again later.")
      }
    }
  })
)
// taking user input as password and confirm password for the user who will  forget their password.
router.get(
  "/detailforchange/:id",
  wrapAsync(async (req, res, next) => {
    if (!req.session.exp) {
      req.session.forget = 1
      return res.redirect("/user/sendthemailagain")
    }
    if (Date.now() >= req.session.exp * 1000) {
      delete req.session.token
      delete req.session.exp
      req.session.forget = 1
      return res.redirect("/user/sendthemailagain")
    }
    const id = req.params.id
    if (id === req.session.token) {
      delete req.session.token
      delete req.session.exp
      return res.render("detailforchangepassword")
    }
    throw AppError("Something went wrong", 555)
  })
)

//posting the entered password and changing the password for user.
router.post(
  "/detailforchange",
  wrapAsync(async (req, res, next) => {
    // below if block case will rarely happen.
    if (!req.session.foremail) {
      req.flash(
        "error",
        "It's too late you lastly tried it for.Please try again"
      )
      return res.redirect("/user/forgetpassword")
    }

    if (req.session.foremail) {
      var email = req.session.foremail
      const user = await User.findOne({ email })
      const { password, password2 } = req.body
      const userData = req.body
      if (password != password2) {
        return res.render("detailforchangepassword", {
          userData,
          match: true,
        })
      }
      if (password.length < 8) {
        return res.render("detailforchangepassword", {
          userData,
        })
      }

      user.setPassword(req.body.password, async (err, user) => {
        if (err) {
          throw new AppError("Something going wrong,please try again")
        }
        await user.save()
      })
      req.flash("success", "your password changed successfully")
      return res.redirect("/user/login")
    } else {
      req.flash("error", "please try again")
      return res.redirect("/user/forgetpassword")
    }
  })
)
// for changing the password rendering the form.
router.get("/changepassword", async (req, res) => {
  res.render("userdashboard/changepassword")
})
// changing user password.
router.post("/changepassword", async (req, res) => {
  const user = await User.findById(req.user._id)
  const { password, password2, currentpassword } = req.body
  const userData = req.body
  if (password != password2) {
    return res.render("pass_for_sec", {
      userData,
      match: true,
    })
  }
  if (password.length < 8) {
    return res.render("pass_for_sec", {
      userData,
    })
  }
  user.changePassword(currentpassword, password, async (err, user) => {
    if (err) {
      throw new AppError(
        "Something going wrong,please try again or fill your last credential carefully"
      )
    }
    await user.save()
  })
  req.flash("success", "your password changed successfully")
  res.redirect("/user/login")
})
//logging out route for user.
router.get(
  "/logout",
  wrapAsync(async (req, res, next) => {
    req.logout()
    req.flash("success", "GoodBye!")
    return res.redirect("/user/login")
  })
)
// sending the verificational link again.
router.get("/sendthemailagain", (_, res) => res.render("sendtheLinkAgain"))

// by using this route user data will update for verificational purpose.
router.post(
  "/sendthemailagain",
  wrapAsync(async (req, res) => {
    const name = generateString(5)
    const email = generateString(10)
    const password = generateString(8)
    // storing token for verification purpose..
    req.session.token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACC_ACTIVATE,
      { expiresIn: "24h" }
    )

    // below are the code for checking the expiry period of token
    var decoded = jwt.decode(req.session.token, { complete: true })
    const exp = decoded.payload.exp
    req.session.exp = exp

    //below if statement will execute in only in the case of forget password.
    if (req.session.forget) {
      const result = await mailForForgetpassword(email, req.session.token)
      delete req.session.forget
      if (result.accepted[0]) {
        req.flash(
          "success",
          "We have sent a verification mail, please check your inbox."
        )
        return res.redirect("/user/sendthemailagain")
      } else {
        req.flash("error", "Something going wrong,please try again")
      }
    }
    // updating the user token with current token.
    const findingTheuser = await User.findOneAndUpdate(
      { email: req.body.email },
      { token: req.session.token },
      {
        new: true,
      }
    )
    if (!findingTheuser) {
      req.flash("error", "please enter the correct mail id")
      return res.redirect("/user/sendthemailagain")
    }
    // now sending the mail again.
    const result = await mailForVerify(req.body.email, req.session.token)
    // result ko bhi check karna hai.
    if (result.accepted[0]) {
      req.flash(
        "success",
        "We have sent a verification mail, please check your inbox."
      )
      return res.redirect("/login")
    } else {
      req.flash("error", "Something going wrong,please try again")
    }
  })
) // adding new user for newsLetter.
router.post(
  "/addnewuser",
  wrapAsync(async (req, res) => {
    const { email } = req.body
    const dateNow = timingFormat(new Date())
    const newUser = new Email({
      email: email,
      date: dateNow.dateformattransaction,
    })
    await newUser.save()
    if (!newUser) {
      throw new AppError("Something going wrong", 404)
    }
    req.flash("success", "Thanks for subscribing our news letter.")
    return res.redirect("/")
  })
)

// route if someone will unsubscribe us.
router.post(
  "/unsubscribe",
  wrapAsync(async (req, res) => {
    const { email } = req.body
    const userforunsubscribe = await Email.findOne({ email: email })
    userforunsubscribe.subscribed = false
    await userforunsubscribe.save()
    if (!userforunsubscribe) {
      throw new AppError("Something going wrong,please try again.", 404)
    }
    req.flash("error", "you won't get any mails anymore.")
    return res.redirect("/")
  })
)

module.exports = router
