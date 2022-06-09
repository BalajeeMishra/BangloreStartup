const express = require("express");
const Webinar = require("../models/webinar.js");
const Cart = require("../models/cart.js");
const router = express.Router();

router.post("/:id", async (req, res) => {
  console.log(req.body.nameofpurchase);
  console.log(typeof req.body.nameofpurchase);
  const { id } = req.params;
  const product = await Webinar.findById(id);
  console.log(product);
  const newCart = new Cart({
    quantity: 1,
    price: 200,
    userId: req.user._id,
    products: [req.params.id],
  });
  await newCart.save();
  res.render("cart", { newCart, product });
});
module.exports = router;
