const express = require("express");
const Webinar = require("../models/webinar.js");
const Purchase = require("../models/purchase");
const Cart = require("../models/cart.js");
const router = express.Router();

router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { purchasecategory } = req.body;
  const purchase = await Purchase.findOne({ nameofpurchase: purchasecategory });
  const price = purchase.price;
  const product = await Webinar.findById(id);
  const cart = await Cart.findOne({ product: id });
  //cart existing and product selected is also existing in that case.
  if (cart && cart.product == id) {
    const hi = cart.categoryofprice.filter(function (e) {
      return price == e.price;
    });
    console.log(hi);
    if (hi.length == 0) {
      console.log("mishras balajee");
      cart.categoryofprice = [
        ...cart.categoryofprice,
        {
          quantity: 1,
          price: price,
          totalPrice: price,
          name: purchasecategory,
        },
      ];
      await cart.save();
    }
    if (hi.length > 0) {
      console.log("mishras");
      const idof_category = hi[0]._id;
      // if selected product is of same category as delected by before.
      Cart.update(
        { "categoryofprice._id": idof_category },
        {
          $set: {
            "categoryofprice.$.quantity": hi[0].quantity + 1,
            // "categoryofprice.$.price": (e.quantity + 1) * e.price,
            "categoryofprice.$.totalPrice": (hi[0].quantity + 1) * hi[0].price,
          },
        },
        function (err, model) {
          if (err) {
            return res.send(err);
          }
        }
      );
    }
  }

  if (!cart) {
    var newCart = new Cart({
      userId: req.user._id,
      product: req.params.id,
      categoryofprice: [
        {
          quantity: 1,
          price: price,
          totalPrice: price,
          name: purchasecategory,
        },
      ],
    });
    await newCart.save();
  }
  return res.redirect("/cart/all");
});
router.get("/all", async (req, res) => {
  const cart = await Cart.find({ userId: req.user._id });
  const products = await Webinar.find({});
  var product = [];
  cart.forEach((e) => {
    products.forEach((p) => {
      if (p._id.equals(e.product)) {
        product = product + [p];
      }
    });
  });
  console.log(product);
  res.status(200).json({ product });
  // res.render("cart", { cart });
});
module.exports = router;
