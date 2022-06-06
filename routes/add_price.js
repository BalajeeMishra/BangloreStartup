const express = require("express");
const Purchase = require("../models/purchase.js");
const router = express.Router();
router.get("/all", async (req, res) => {
  const purchase = await Purchase.find({});
  res.render("admin/allpurchaseoption", { purchase });
});
router.get("/", async (req, res) => {
  res.render("admin/addprice");
});
router.post("/", async (req, res) => {
  const newPurchase = new Purchase(req.body);
  await newPurchase.save();
  res.redirect("/price/all");
});
router.get("/edit_purchase/:id", async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findById(id);
  res.render("admin/edit_price", { purchase });
});
router.put("/edit_purchase/:id", async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  req.flash("success", "purchase updated");
  res.redirect("/price/all");
});

router.get("/delete_purchase/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedPurchase = await Purchase.findByIdAndDelete(id);
  req.flash("success", "purchase deleted");
  res.redirect("/price/all");
});
module.exports = router;
