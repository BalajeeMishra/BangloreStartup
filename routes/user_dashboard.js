const express = require("express")
const User = require("../models/user")
const Cart = require("../models/cart")
const router = express.Router()
const wrapAsync = require("../controlError/wrapAsync.js")
const Department = require("../models/department")
// this model is just for storing purchased data from cart.
const PurchaseOfUser = require("../models/purchase_Schema")
// user dashboard
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const userdata = await User.findById(req.user._id)
    const industries = await Department.find({ visibilty: true }).sort("order")
    return res.render("userdashboard/dashboard", {
      userdata,
      industries,
      path: "dashboard",
    })
  })
)

// purchase historyyy
router.get(
  "/purchase_history",
  wrapAsync(async (req, res) => {
    const Total = 0
    const TotalPrice = 0
    let purchase_history = await PurchaseOfUser.find({
      userId: req.user._id,
    })
      .populate("product")
      .sort({ modifiedOn: "-1" })
    // res.send(purchase_history);
    res.render("userdashboard/purchasehistory", {
      purchase_history,
      Total,
      TotalPrice,
      path: "purchase",
    })
  })
)

router
  .route("/edit_profile")
  .get(
    wrapAsync(async (req, res) => {
      const { _id: userId } = req.user
      const userdata = await User.findById(userId)
      const industries = await Department.find({ visibilty: true }).sort(
        "order"
      )
      return res.render("userdashboard/editInfo", {
        userdata,
        industries,
        path: "dashboard",
      })
    })
  )
  .post(
    wrapAsync(async (req, res) => {
      const { _id: userId } = req.user
      const userdata = await User.findById(userId)
      const {
        firstname = userdata.firstname,
        lastname = userdata.lastname,
        phone = userdata.phone,
        address = userdata.address,
        company = userdata.company,
        jobtitle = userdata.jobtitle,
        industry = userdata.industry,
        country = userdata.country,
        state = userdata.state,
        zipcode = userdata.zipcode,
      } = req.body

      await userdata.update({
        firstname,
        lastname,
        phone,
        address,
        company,
        jobtitle,
        industry,
        country,
        state,
        zipcode,
      })
      // await userdata.save()
      req.flash("success", "Your details has been updated.")
      return res.status(200).redirect("/user/dashboard")
    })
  )

// my certificates.
router.get("/certificates", (req, res) =>
  res.render("userdashboard/certificates", { path: "certificates" })
)

// live credential.
router.get(
  "/live_credentials",
  wrapAsync(async (req, res) => {
    let purchase_history = await PurchaseOfUser.find({
      userId: req.user._id,
    })
      .populate("product")
      .sort({ modifiedOn: "-1" })
    res.render("userdashboard/live_credentials", {
      path: "live_credentials",
      purchase_history,
    })
  })
)

// recorded
router.get("/recorded", async (req, res) => {
  let purchase_history = await PurchaseOfUser.find({
    userId: req.user._id,
  })
    .populate("product")
    .sort({ modifiedOn: "-1" })
  res.render("userdashboard/recorded", { path: "recorded", purchase_history })
})

//added by me.
// adding new user for newsLetter.
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
