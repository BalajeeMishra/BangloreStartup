const express = require("express")
const User = require("../models/user")
const Cart = require("../models/cart")
const router = express.Router()
const wrapAsync = require("../controlError/wrapAsync.js")
const Department = require("../models/department")
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
    let cart = await Cart.find({ userId: req.user._id, status: true }).populate(
      "product"
    )

    res.render("userdashboard/purchasehistory", {
      cart,
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
      console.log(req.body)
      // await userdata.save()
      req.flash("success", "Your details has been updated.")
      return res.status(200).redirect("/user/dashboard")
    })
  )

router.get("/certificates", (req, res) =>
  res.render("userdashboard/certificates", { path: "certificates" })
)

router.get("/live_credentials", (req, res) =>
  res.render("userdashboard/live_credentials", { path: "live_credentials" })
)

router.get("/recorded", (req, res) =>
  res.render("userdashboard/recorded", { path: "recorded" })
)

module.exports = router
