const express = require("express")
const Coupon = require("../models/coupon_code")
const router = express.Router()
const wrapAsync = require("../controlError/wrapAsync")

// route for entering the couponcode.
router.get("/", async (req, res) => {
  res.render("admin/addCouponCodeDetail")
})

// route for saving the couponcode.
router.post(
  "/",
  wrapAsync(async (req, res) => {
    // new code
    if (req.body.discountinpercentage && req.body.discountinprice) {
      console.log("balajeee")
      req.body.discountinprice = null
    }
    const newCoupon = new Coupon(req.body)
    await newCoupon.save()
    res.redirect("/coupon/all")
  })
)

// route for showing all the coupon code.
router.get("/all", async (req, res) => {
  const coupons = await Coupon.find({})
  return res.render("admin/allCouponecode", { coupons })
  //   res.render("admin/showallcoupone");
})

// route for updating all the coupon code.
router.get("/edit_coupon/:id", async (req, res) => {
  const { id } = req.params
  const edit_coupon_code = await Coupon.findById(id)
  res.render("admin/editCouponedetail", { edit_coupon_code })
})

//route for saving the detail taken in  form of edition of coupon.
router.put(
  "/edit_coupon/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    await Coupon.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    })
    req.flash("success", "coupon updated")
    res.redirect("/coupon/all")
  })
)
module.exports = router
