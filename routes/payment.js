const express = require("express");
const wrapasync = require("../controlError/wrapasync");
const router = express.Router();
const Cart = require("../models/cart");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const paypal = require("paypal-rest-sdk");
//stripe credential.
const PUBLISHABLE_KEY =
  "pk_test_51KTsAkSCz6YD7QQyTrES0nTpBH1THPy0tkcQyqmsunOkdyzTaFYlO3cySz8tisvKxF588bZXzA5OqOn6NhOMH72h0080OZDqHh";
const SECRET_KEY =
  "sk_test_51KTsAkSCz6YD7QQytElBt5LdtRIgvpauD7S6UuNy5U1AEiQJNbY7hWkRgZ60VjHp3KmhBfCJAuIq4SCjLCn3H7hd00F7BIykKO";
const stripe = require("stripe")(SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:3000/payment";
//paypal credential.
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARBSCb6iNGaHIC3byeoOUuZyMwmN0fdtiylOXupMoMoKHjJbn5fNfaFbLoKqAhm-DLkVIJQTBuK4Qc-9",
  client_secret:
    "EFbnaSsvOF6knHvTNewuxNk0SSSoO-YWYzqYPN3eRAYhL-uJ9OKfBTf04L7nS44vdLZIElLYIU4p_qMx",
});

//payment option route either paypal or stripe.
router.get("/paymentoption", async (req, res) => {
  res.render("paymentoption");
});

// payment with stripe input form.
router.get(
  "/paymentwithstripe",
  wrapasync(async (req, res) => {
    let cart = await Cart.find({ userId: req.user._id }).populate("product");
    let total = 0;
    cart.forEach((c) => {
      c.categoryofprice.forEach((cat) => {
        total = total + cat.totalPrice;
      });
    });
    res.render("checkout", { cart, total });
  })
);

// router.post("/", function (req, res) {
//   // Moreover you can take more details from user
//   // like Address, Name, etc from form
//   stripe.customers
//     .create({
//       email: req.body.stripeEmail,
//       source: req.body.stripeToken,
//       name: "Gautam Sharma",
//       address: {
//         line1: "TC 9/4 Old MES colony",
//         postal_code: "110092",
//         city: "New Delhi",
//         state: "Delhi",
//         country: "India",
//       },
//     })
//     .then((customer) => {
//       return stripe.charges.create({
//         amount: 7000, // Charing Rs 25
//         description: "Web Development Product",
//         currency: "USD",
//         customer: customer.id,
//       });
//     })
//     .then((charge) => {
//       res.send("Success"); // If no error occurs
//     })
//     .catch((err) => {
//       res.send(err); // If some error occurs
//     });
// });

// payment with stripe processing
router.post(
  "/paymentwithstripe/create-checkout-session",
  wrapasync(async (req, res) => {
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
    });
    res.redirect(303, session.url);
  })
);

// success route of payment with stripe processing
router.get("/success", (req, res) => {
  res.render("success");
});
// cancel route of payment with stripe processing
router.get("/cancel", (req, res) => {
  res.render("cancel");
});

// paypal integration.
//paymentwithpaypal page.
router.get(
  "/paymentwithpaypal",
  wrapasync(async (req, res) => {
    let cart = await Cart.find({ userId: req.user._id }).populate("product");
    let total = 0;
    cart.forEach((c) => {
      c.categoryofprice.forEach((cat) => {
        total = total + cat.totalPrice;
      });
    });
    res.render("paypal_payment", { total });
  })
);
//paymentprocessingwithpaypal post route.
router.post(
  "/paymentwithpaypal",
  wrapasync(async (req, res, next) => {
    console.log(req.body.totalpayment);
    const priced = parseInt(req.body.totalpayment);
    req.session.price = priced;
    // const { totalpayment } = req.body;
    // console.log(totalpayment);
    // console.log(priced);
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/payment/successtransaction",
        cancel_url: "http://localhost:3000/paymentWithPaypal/canceltransaction",
      },
      transactions: [
        {
          item_list: {
            items: [
              // {
              //   name: "Redhock Bar Soap",
              //   sku: "001",
              //   price: "25.00",
              //   currency: "USD",
              //   quantity: 1,
              // },
              // {
              //   name: "All your product",
              //   sku: "001",
              //   price: "25.00",
              //   currency: "USD",
              //   quantity: 1,
              // },
            ],
          },
          amount: {
            currency: "USD",
            total: priced,
          },
          description: "Washing Bar soap",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  })
);
// success route of payment with paypal processing
router.get(
  "/successtransaction",
  wrapasync(async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: req.session.price,
          },
        },
      ],
    };

    // Obtains the transaction details from paypal
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
          throw error;
        } else {
          delete req.session.price;
          // res.json({ payment });
          res.send("Success");
        }
      }
    );
  })
);
// cancel route of payment with paypal processing
router.get("/canceltransaction", (req, res) => res.send("Cancelled"));

module.exports = router;
