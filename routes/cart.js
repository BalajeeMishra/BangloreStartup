const express = require("express");
const Webinar = require("../models/webinar.js");
const Cart = require("../models/cart.js");
const router = express.Router();

router.get("/:id", async (req, res) => {
  //   const cart = new Cart();
  //   const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, {
  //     runValidators: true,
  //     new: true,
  //   });
  const { id } = req.params;
  const selectedWebinar = await Webinar.findById(id);
  res.render("cart", { selectedWebinar });
});
module.exports = router;
