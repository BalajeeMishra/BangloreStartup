const express = require("express");
const router = express.Router();
const PUBLISHABLE_KEY =
  "pk_test_51KTsAkSCz6YD7QQyTrES0nTpBH1THPy0tkcQyqmsunOkdyzTaFYlO3cySz8tisvKxF588bZXzA5OqOn6NhOMH72h0080OZDqHh";

const SECRET_KEY =
  "sk_test_51KTsAkSCz6YD7QQytElBt5LdtRIgvpauD7S6UuNy5U1AEiQJNbY7hWkRgZ60VjHp3KmhBfCJAuIq4SCjLCn3H7hd00F7BIykKO";
const stripe = require("stripe")(SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:3000/payment";
router.get("/", function (req, res) {
  res.render("checkout");
});

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
router.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });
  console.log(session);
  res.redirect(303, session.url);
});
router.get("/success", (req, res) => {
  res.render("success");
});
router.get("/cancel", (req, res) => {
  res.render("cancel");
});
module.exports = router;
