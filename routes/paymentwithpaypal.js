const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARBSCb6iNGaHIC3byeoOUuZyMwmN0fdtiylOXupMoMoKHjJbn5fNfaFbLoKqAhm-DLkVIJQTBuK4Qc-9",
  client_secret:
    "EFbnaSsvOF6knHvTNewuxNk0SSSoO-YWYzqYPN3eRAYhL-uJ9OKfBTf04L7nS44vdLZIElLYIU4p_qMx",
});

router.get("/", async (req, res) => {
  res.render("paypal_payment");
});
router.post("/", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/paymentWithPaypal/success",
      cancel_url: "http://localhost:3000/paymentWithPaypal/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Redhock Bar Soap",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00",
        },
        description: "Washing Bar soap",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
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
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
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
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});

router.get("/cancel", (req, res) => res.send("Cancelled"));

module.exports = router;
