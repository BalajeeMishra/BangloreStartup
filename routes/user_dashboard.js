const express = require("express");
const User = require("../models/user");
const Cart = require("../models/cart");
const router = express.Router();
const wrapAsync = require("../controlError/wrapAsync.js");
// user dashboard
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const userdata = await User.findById(req.user._id);
    res.render("userdashboard/userdashboarddata", { userdata });
  })
);
// purchase historyyy
router.get(
  "/purchase_history",
  wrapAsync(async (req, res) => {
    const Total = 0;
    const TotalPrice = 0;
    let cart = await Cart.find({ userId: req.user._id }).populate("product");
    cart = cart.filter((e) => {
      return e.status == true;
    });
    res.render("userdashboard/purchasehistory", { cart, Total, TotalPrice });
  })
);

module.exports = router;
