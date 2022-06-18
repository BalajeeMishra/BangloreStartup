const express = require("express")
const router = express.Router()
const Cart = require("../models/cart")
const Coupon = require("../models/coupon_code")
const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")
const paypal = require("paypal-rest-sdk")
const { isSuccess } = require("../helper/successtransaction_middleware")
//stripe credential.
const PUBLISHABLE_KEY =
  "pk_test_51KTsAkSCz6YD7QQyTrES0nTpBH1THPy0tkcQyqmsunOkdyzTaFYlO3cySz8tisvKxF588bZXzA5OqOn6NhOMH72h0080OZDqHh"
const SECRET_KEY =
  "sk_test_51KTsAkSCz6YD7QQytElBt5LdtRIgvpauD7S6UuNy5U1AEiQJNbY7hWkRgZ60VjHp3KmhBfCJAuIq4SCjLCn3H7hd00F7BIykKO"
const stripe = require("stripe")(SECRET_KEY)
const YOUR_DOMAIN = "http://test.mrityunjay.com:5000/payment"
//paypal credential.
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARBSCb6iNGaHIC3byeoOUuZyMwmN0fdtiylOXupMoMoKHjJbn5fNfaFbLoKqAhm-DLkVIJQTBuK4Qc-9",
  client_secret:
    "EFbnaSsvOF6knHvTNewuxNk0SSSoO-YWYzqYPN3eRAYhL-uJ9OKfBTf04L7nS44vdLZIElLYIU4p_qMx",
})

// checking if a user got a coupone code.
router.get("/haveaCouponecode", async (req, res) => {
  return res.render("haveaCouponecode")
})
// checking whether the user entering the right coupon code or not.
router.post(
  "/haveaCouponecode",
  wrapAsync(async (req, res) => {
    const { coupon } = req.body
    const [matchingtheCouponCode] = await Coupon.find({ coupon })
    console.log(matchingtheCouponCode)
    if (matchingtheCouponCode) {
      req.session.discountinpercentage =
        matchingtheCouponCode.discountinpercentage
      req.session.discountinprice = matchingtheCouponCode.discountinprice
      return res.redirect("/cart/all")
    }
    return res.redirect("/payment/haveaCouponecode")
  })
)
// payment with stripe input form.
router.get(
  "/paymentwithstripe",
  wrapAsync(async (req, res) => {
    let cart = await Cart.find({ userId: req.user._id }).populate("product")
    let total = cart.reduce(
      (acc, item) =>
        item.reduce(
          (itemTotal, { categoryofprice }) =>
            itemTotal + categoryofprice.totalPrice,
          acc
        ),
      0
    )
    if (req.session.discountinprice) {
      total = total - req.session.discountinprice
    }
    if (req.session.discountinpercentage) {
      total = total - total * (req.session.discountinpercentage / 100)
    }
    res.render("checkout", { cart, total: parseInt(total) })
  })
)

// payment with stripe processing
router.post(
  "/paymentwithstripe/checkout",
  wrapAsync(async (req, res) => {
    // storing session here so that we can store the amount in success route.
    req.session.amount = req.body.totalprice
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "your selected product",
            },
            unit_amount: req.body.totalprice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    })

    res.redirect(303, session.url)
  })
)

// success route of payment with stripe processing
router.get(
  "/success",
  wrapAsync(async (req, res, next) => {
    //new added code.
    if (req.session.amount) {
      req.session.method = "Stripe"
      isSuccess(req, res, next)
    }
    return res.redirect("/user/dashboard/purchase_history")
  })
)

// cancel route of payment with stripe processing
router.get("/cancel", (req, res) => {
  delete req.session.amount
  return res.render("cancel")
})
// paypal integration.
//paymentwithpaypa"l page.
router.get(
  "/paymentwithpaypal",
  wrapAsync(async (req, res) => {
    let cart = await Cart.find({ userId: req.user._id }).populate("product")
    let total = 0
    cart.forEach((c) => {
      c.categoryofprice.forEach((cat) => {
        total = total + cat.totalPrice
      })
    })
    if (req.session.discountinprice) {
      total = total - req.session.discountinprice
    }
    if (req.session.discountinpercentage) {
      total = total - total * (req.session.discountinpercentage / 100)
    }
    res.render("paypal_payment", { total })
  })
)
//paymentprocessingwithpaypal post route.
router.post(
  "/paymentwithpaypal",
  wrapAsync(async (req, res, next) => {
    const priced = parseInt(req.body.totalpayment)
    req.session.amount = priced
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url:
          "http://test.mrityunjay.com:5000/payment/successtransaction",
        cancel_url: "http://test.mrityunjay.com:5000/payment/canceltransaction",
      },
      transactions: [
        {
          item_list: {
            items: [],
          },
          amount: {
            currency: "USD",
            total: priced,
          },
          description: "Thank you for purchasing",
        },
      ],
    }

    paypal.payment.create(
      create_payment_json,
      wrapAsync(async (error, payment) => {
        if (error) {
          throw error
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              res.redirect(payment.links[i].href)
            }
          }
        }
      })
    )
  })
)
// success route of payment with paypal processing
router.get(
  "/successtransaction",
  wrapAsync(async (req, res, next) => {
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: req.session.amount,
          },
        },
      ],
    }
    // Obtains the transaction details from paypal
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      (error, payment) => {
        //When error occurs when due to non-existent transaction, throw an error else logging the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
          throw error
        } else {
          req.session.method = "Paypal"
          isSuccess(req, res, next)
          res.send("Success")
        }
      }
    )
  })
)
// cancel route of payment with paypal processing
router.get("/canceltransaction", (req, res) => {
  delete req.session.amount
  res.send("Cancelled")
})

module.exports = router
