const express = require("express");
const Coupon = require("../models/coupon_code");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");

// route for entering the couponcode.
router.get("/", async (req, res) => {
  res.render("admin/addCouponCodeDetail");
});

// route for saving the couponcode.

router.post(
  "/",
  wrapAsync(async (req, res) => {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
  })
);

// route for showing all the coupon code.
router.get("/all", async (req, res) => {
  const coupons = await Coupon.find({});
  res.render("admin/showallcoupone");
});
module.exports = router;
