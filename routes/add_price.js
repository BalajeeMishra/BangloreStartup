const express = require("express");
const Purchase = require("../models/purchase.js");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");

// route for all purchaseoption added by admin
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const purchase = await Purchase.find({});
    res.render("admin/allpurchaseoption", { purchase });
  })
);
// rendering the category of pricing page.
router.get(
  "/",
  wrapAsync(async (req, res) => res.render("admin/addprice"))
);

// adding the category of pricing in database.
router.post(
  "/",
  wrapAsync(async (req, res) => {
    const newPurchase = new Purchase(req.body);
    await newPurchase.save();
    res.redirect("/price/all");
  })
);

// route of rendering the editing form for category of price.
router.get(
  "/edit_purchase/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const purchase = await Purchase.findById(id);
    res.render("admin/edit_price", { purchase });
  })
);

// this route will update the selected category of price.
router.put(
  "/edit_purchase/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Purchase.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    req.flash("success", "purchase updated");
    res.redirect("/price/all");
  })
);
// deleting the selected category of price
router.get(
  "/delete_purchase/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Purchase.findByIdAndDelete(id);
    req.flash("success", "purchase deleted");
    res.redirect("/price/all");
  })
);
module.exports = router;
