const express = require("express");
const Webinar = require("../models/webinar.js");
const Category = require("../models/department");
const router = express.Router();
const { upload } = require("../helper/multer");

router.get("/", async (req, res) => {
  const webinar = await Webinar.find({});
  res.render("admin/dashboard");
});
router.get("/allproduct", async (req, res) => {
  const webinar = await Webinar.find({});
  res.render("admin/listedproduct", { webinar });
});
router.get("/edit_product/:id", async (req, res) => {
  const { id } = req.params;
  const webinar = await Webinar.findById(id);
  const categories = await Category.find({});
  res.render("admin/editlistedproduct", { webinar, categories });
});

router.put("/edit_product/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const webinar = await Webinar.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  webinar.image = req.file.filename;
  await webinar.save();
  res.redirect("/admin/allproduct");
});

router.get("/delete_product/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedProduct = await Webinar.findByIdAndDelete(id);
  req.flash("success", "webinar  deleted");
  res.redirect("/admin/allproduct");
});

router.get("/category", async (req, res) => {
  res.render("admin/add_category");
});
router.post("/add-category", async (req, res) => {
  const newCategory = new Category(req.body);
  await newCategory.save();
  res.redirect("/admin/allcategories");
});

router.get("/allcategories", async (req, res) => {
  const category = await Category.find({});
  res.render("admin/allcategory", { category });
});
router.get("/edit_category/:id", async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  res.render("admin/editcategory", { category });
});
router.put("/edit_category/:id", async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  req.flash("success", "category updated");
  res.redirect("/admin/allcategories");
});
router.get("/delete_category/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedCategory = await Category.findByIdAndDelete(id);
  req.flash("success", "category deleted");
  res.redirect("/admin/allcategories");
});
module.exports = router;
