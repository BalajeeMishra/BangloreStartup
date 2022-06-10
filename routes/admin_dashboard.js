const express = require("express");
const Webinar = require("../models/webinar.js");
const Category = require("../models/department");
const router = express.Router();
const { upload } = require("../helper/multer");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");
//its admin dashboard

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const webinar = await Webinar.find({});
    res.render("admin/dashboard");
  })
);
// all listed webinar
router.get(
  "/allproduct",
  wrapAsync(async (req, res) => {
    const webinar = await Webinar.find({});
    res.render("admin/listedproduct", { webinar });
  })
);
//getting edit form for webinar
router.get(
  "/edit_product/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const webinar = await Webinar.findById(id);
    // var time=moment(detail[0].birthday).utc().format('YYYY/MM/DD');
    var date = new Date(webinar.webinartiming);
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var todayDate = String(date.getDate()).padStart(2, "0");
    var datePattern = year + "-" + month + "-" + todayDate;
    console.log(datePattern);
    const categories = await Category.find({});
    res.render("admin/editlistedproduct", { webinar, categories, datePattern });
  })
);
// editing webinar
router.put(
  "/edit_product/:id",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const webinar = await Webinar.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    if (typeof req.file != "undefined") {
      webinar.image = req.file.filename;
    }
    webinar.category = req.body.nameofdepartment;
    await webinar.save();
    console.log(webinar);
    res.redirect("/admin/allproduct");
  })
);
//deleting webinar
router.get(
  "/delete_product/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedProduct = await Webinar.findByIdAndDelete(id);
    req.flash("success", "webinar  deleted");
    res.redirect("/admin/allproduct");
  })
);
// category or say industry adding page.
router.get(
  "/category",
  wrapAsync(async (req, res) => {
    res.render("admin/add_category");
  })
);
// adding industry in database.
router.post(
  "/add-category",
  wrapAsync(async (req, res) => {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.redirect("/admin/allcategories");
  })
);
// from here we can see all category page.
router.get(
  "/allcategories",
  wrapAsync(async (req, res) => {
    const category = await Category.find({});
    res.render("admin/allcategory", { category });
  })
);

// by this route we are rendering edit form of industry.
router.get(
  "/edit_category/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    res.render("admin/editcategory", { category });
  })
);
// this will add edited category in database.
router.put(
  "/edit_category/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    req.flash("success", "category updated");
    res.redirect("/admin/allcategories");
  })
);
// deleting the category as we want.
router.get(
  "/delete_category/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    req.flash("success", "category deleted");
    res.redirect("/admin/allcategories");
  })
);
module.exports = router;
