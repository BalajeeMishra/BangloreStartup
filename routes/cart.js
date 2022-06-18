const express = require("express")
const Webinar = require("../models/webinar.js")
const Purchase = require("../models/purchase")
const Cart = require("../models/cart.js")
const router = express.Router()
const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")
const User = require("../models/user.js")

router.get(
  "/checkout",
  wrapAsync(async (req, res) => {
    const { _id: userId } = req.user
    const cart = await Cart.find({ userId }).populate(["userId", "product"])
    let total = 0
    cart.forEach((c) => {
      c.categoryofprice.forEach((cat) => {
        total = total + cat.totalPrice
      })
    })
    return res.status(200).render("checkout", {
      cart,
      total,
      userdata: cart[0].userId,
    })
  })
)

// adding cart for a user in the database........
router.post(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const { purchasecategory } = req.body
    //finding on the basis of Purchase model.
    const purchase = await Purchase.findOne({
      nameofpurchase: purchasecategory,
    })
    const price = purchase.price
    var query = null
    if (req.user) {
      query = { userId: req.user._id, product: id }
    }
    if (!req.user) {
      query = { cartSessionId: req.sessionID, product: id }
    }
    const cart = await Cart.findOne(query)
    //cart existing and product selected is also existing in that case.
    if (cart && cart.product == id) {
      const hi = cart.categoryofprice.filter(function (e) {
        return price == e.price
      })
      //if product exist  but not from the same product category then we are adding that one.
      if (hi.length == 0) {
        cart.categoryofprice = [
          ...cart.categoryofprice,
          {
            quantity: 1,
            price: price,
            totalPrice: price,
            name: purchasecategory,
          },
        ]
        await cart.save()
      }
      //in case if product of same category already existed.
      if (hi.length > 0) {
        const idof_category = hi[0]._id
        // if selected product is of same category as delected by before.
        Cart.updateOne(
          { "categoryofprice._id": idof_category },
          {
            $set: {
              "categoryofprice.$.quantity": hi[0].quantity + 1,
              // "categoryofprice.$.price": (e.quantity + 1) * e.price,
              "categoryofprice.$.totalPrice":
                (hi[0].quantity + 1) * hi[0].price,
            },
          },
          function (err, model) {
            if (err) {
              return res.send(err)
            }
          }
        )
      }
    }

    if (!cart) {
      var newCart = new Cart({
        userId: req.user ? req.user._id : null,
        cartSessionId: req.sessionID,
        product: req.params.id,
        categoryofprice: [
          {
            quantity: 1,
            price: price,
            totalPrice: price,
            name: purchasecategory,
          },
        ],
      })
      await newCart.save()
      // storing in session for the user who is not logged in
      if (!req.session.cartsofnonregisteruser) {
        req.session.cartsofnonregisteruser = []
      }
      req.session.cartsofnonregisteruser.push(newCart)
      if (req.user) {
        const user = await User.findById(req.user._id)
        user.cart = newCart._id
        await user.save()
      }
    }
    return res.redirect("/cart/all")
  })
)
// finding all the cart associated with user and clearing too if they choose so.
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { clear, id } = req.query
    const Total = 0
    const TotalPrice = 0
    // adding the new line of code here.
    const discountinprice = req.session.discountinprice
    const discountinpercentage = req.session.discountinpercentage
    // basically passing query because we need the data of cart which having visibility of true.
    let query1 = { cartSessionId: req.sessionID, visibility: true }

    var cart = await Cart.find({
      query1,
    }).populate("product")
    if (cart.length && req.user) {
      await Cart.find(query1).updateMany({}, { userId: req.user._id })
    }

    // clear if already logged in.
    if (clear && req.user) {
      if (req.session.discountinprice) {
        delete req.session.discountinprice
        console.log("lets,see 1", req.session.discountinprice)
      }
      if (req.session.discountinpercentage) {
        delete req.session.discountinpercentage
        console.log("lets,see 2", req.session.discountinpercentage)
      }
      await req.session.save()
      // await Cart.findOneAndDelete({ userId: req.user._id });
      await Cart.deleteMany({ userId: req.user._id })
      cart = []
      return res.render("cart", {
        cart,
        Total,
        TotalPrice,
        discountinpercentage,
        discountinprice,
      })
    }

    if (clear && !req.user) {
      if (req.session.discountinprice) {
        delete req.session.discountinprice
        console.log("lets,see 1", req.session.discountinprice)
      }
      if (req.session.discountinpercentage) {
        delete req.session.discountinpercentage
        console.log("lets,see 2", req.session.discountinpercentage)
      }
      await req.session.save()
      // await Cart.findOneAndDelete({ userId: req.user._id });
      await Cart.deleteMany({ cartSessionId: req.sessionID })
      cart = []
      return res.render("cart", {
        cart,
        Total,
        TotalPrice,
        discountinpercentage,
        discountinprice,
      })
    }

    if (id || req.user) {
      var userid = id ? id : req.user._id
      let query2 = { userId: userid, visibility: true }
      var cart = await Cart.find(query2).populate("product")
      return res.render("cart", {
        cart,
        Total,
        TotalPrice,
        discountinpercentage,
        discountinprice,
      })
    }

    return res.render("cart", {
      cart,
      Total,
      TotalPrice,
      discountinpercentage,
      discountinprice,
    })
  })
)
// increasing decresing the product category inside cart.
router.get(
  "/:cartId/:categoryId",
  wrapAsync(async (req, res, next) => {
    const { cartId, categoryId } = req.params
    const { action } = req.query
    let query = null
    // passed query if user is logged in.
    if (req.user) {
      query = { userId: req.user._id, _id: cartId }
    }
    // passing the query if no user is there that means finding with session id.
    if (!req.user) {
      query = { cartSessionId: req.sessionID, _id: cartId }
    }
    const cart = await Cart.findOne(query)
    const [selectedProduct] = cart.categoryofprice.filter((doc) =>
      doc._id.equals(categoryId)
    )
    // delete all cart if there is only one item left in the cart
    if (
      cart.categoryofprice.length === 1 &&
      selectedProduct.quantity === 1 &&
      action == -1
    ) {
      await cart.delete()
      return res.status(200).redirect("/cart/all")
    }
    // remove selectedProdect if there is only one product of that priceCategory
    if (selectedProduct.quantity === 1 && action == -1) {
      indexOfSelectedProduct = cart.categoryofprice.indexOf(selectedProduct)
      cart.categoryofprice = cart.categoryofprice.splice(
        indexOfSelectedProduct,
        1
      )
      await cart.save()
      return res.status(200).redirect("/cart/all")
    }
    // increment or decrement the count of cart product
    Cart.updateOne(
      { "categoryofprice._id": categoryId },
      {
        $set: {
          "categoryofprice.$.quantity":
            selectedProduct.quantity + parseInt(action),
          // "categoryofprice.$.price": (e.quantity + 1) * e.price,
          "categoryofprice.$.totalPrice":
            (selectedProduct.quantity + parseInt(action)) *
            selectedProduct.price,
        },
      },
      {},
      (err, model) => {
        if (err) return next(err)
      }
    )

    return res.status(200).redirect("/cart/all")
  })
)

module.exports = router
