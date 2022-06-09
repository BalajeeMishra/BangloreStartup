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
  // const product = await Webinar.findById(id);
  const cart = await Cart.findOne({ product: id });

  //cart existing and product selected is also existing in that case.
  if (cart && cart.product == id) {
    const hi = cart.categoryofprice.filter(function (e) {
      return price == e.price;
    });
    console.log({ hi });
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
      Cart.updateOne(
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
  const Total = 0;
  const cart = await Cart.find({ userId: req.user._id }).populate("product");
  res.render("cart", { cart, Total });
  // res.send("hello worldd");
});

router.get("/:cartId/:categoryId", async (req, res, next) => {
  const { cartId, categoryId } = req.params;
  const { action } = req.query;
  const cart = await Cart.findById(cartId);
  const [selectedProduct] = cart.categoryofprice.filter((doc) =>
    doc._id.equals(categoryId)
  );

  if (
    cart.categoryofprice.length === 1 &&
    selectedProduct.quantity === 1 &&
    action == -1
  ) {
    await cart.delete();
    return res.status(200).redirect("/cart/all");
  }
  if (selectedProduct.quantity === 1 && action == -1) {
    indexOfSelectedProduct = cart.categoryofprice.indexOf(selectedProduct);
    cart.categoryofprice = cart.categoryofprice.splice(
      indexOfSelectedProduct,
      1
    );
    await cart.save();
    return res.status(200).redirect("/cart/all");
  }

  Cart.updateOne(
    { "categoryofprice._id": categoryId },
    {
      $set: {
        "categoryofprice.$.quantity":
          selectedProduct.quantity + parseInt(action),
        // "categoryofprice.$.price": (e.quantity + 1) * e.price,
        "categoryofprice.$.totalPrice":
          (selectedProduct.quantity + parseInt(action)) * selectedProduct.price,
      },
    },
    {},
    (err, model) => {
      if (err) return next(err);
    }
  );

  return res.status(200).redirect("/cart/all");
});

module.exports = router;
