const express = require("express");
const Purchase = require("../models/purchase.js");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");

// route for all purchaseoption added by admin
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const purchase = await Purchase.find({}).sort("order");
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
// for ups and down.
router.get(
  "/upanddownthe_price/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { action, position } = req.query;
    position = parseInt(position);
    const categories = await Purchase.find({}).sort("order");
    let [selectedCategory] = categories.filter((doc) => doc._id.equals(id));

    const index = categories.indexOf(selectedCategory);
    if (action == 1 && categories[0].order == position) {
      req.flash(
        "error",
        "you can't up the category of price which is on topmost position."
      );
      return res.redirect("/price/all");
    }
    if (action == -1 && position == categories[categories.length - 1].order) {
      req.flash(
        "error",
        "you can't down the category that is on last position."
      );
      return res.redirect("/price/all");
    }
    if (action == 1) {
      var lastindexorder = categories[index - 1].order;
    }
    if (action == -1) {
      var nextindexorder = categories[index + 1].order;
    }
    var query =
      action == 1
        ? { $or: [{ order: position }, { order: lastindexorder }] }
        : { $or: [{ order: position }, { order: nextindexorder }] };
    const categoryList = await Purchase.find(query);
    [categoryList[0].order, categoryList[1].order] = [
      categoryList[1].order,
      categoryList[0].order,
    ];
    await categoryList[0].save();
    await categoryList[1].save();
    return res.redirect("/price/all");
  })
);
module.exports = router;
