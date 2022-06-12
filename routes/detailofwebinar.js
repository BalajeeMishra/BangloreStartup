const express = require("express");
const Webinar = require("../models/webinar.js");
const Purchase = require("../models/purchase");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");
const { upload } = require("../helper/multer");
const Department = require("../models/department");
const { query } = require("express");
// add the detail of webinar.
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const categories = await Department.find({}).sort("order");
    if (!categories) {
      req.flash("error", "First enter the field of market categories");
      return res.redirect("/admin/category");
    }
    return res.render("admin/webinar_detail_one", { categories });
  })
);

// adding the first page of webinar form here in database.
router.post(
  "/",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const newWebinar = new Webinar(req.body);
    if (typeof req.file != "undefined") {
      newWebinar.image = req.file.filename;
    }
    const newWebinarcollected = await newWebinar.save();
    req.session.newWebinarData = newWebinarcollected;
    res.redirect("/webinar/moredetail");
  })
);
//moredetail pe koi ja hi nhi sakta if piche ka detail add nhi kiya hai..
// rendering the form of 2nd page of webinar.
router.get(
  "/moredetail",
  wrapAsync(async (req, res) => {
    const detailOfNew = req.session.newWebinarData;
    res.render("admin/webinar_detail_two", { detailOfNew });
  })
);

// adding the 2nd page detail in databases.
router.post(
  "/moredetail/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { advantageous, abouttopic, bestfor, agenda } = req.body;
    await Webinar.findOneAndUpdate(
      { id },
      { advantageous, abouttopic, bestfor, agenda }
    );
    delete req.session.newWebinarData;
    res.redirect("/");
  })
);
// all webinar and seminar route for user.
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { category = "" } = req.query;
    let categoryList = category.split("_");
    let query = { category: { $in: [...categoryList] } };
    const department = await Department.find({}).sort("order");
    const allWebinar = await Webinar.find(category.length ? query : {}).sort(
      "time"
    );

    if (!allWebinar.length) {
      req.flash("error", "No match found");
      return res.redirect("/webinar/all");
    }
    return res.render("allwebinar", {
      allWebinar,
      department,
      categoryList,
    });
  })
);

// just view the detail route of any webinar or seminar.
router.get(
  "/allnext/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const detailedWebinar = await Webinar.findById(id);
    const purchase = await Purchase.find({}).sort("order");
    res.render("nextdetailofwebinar", { detailedWebinar, purchase });
  })
);

// serching of product.
router.post(
  "/search",
  wrapAsync(async (req, res) => {
    const department = await Department.find({});
    str = '"' + req.body.courses + '"';
    str1 = "'" + str + "'";
    let searchedWebinar = [];
    if (str1.trim().indexOf(" ") != -1) {
      searchedWebinar = await Webinar.find({
        $text: { $search: str1 },
      });
      if (searchedWebinar.length > 0) {
        const allWebinar = searchedWebinar;
        return res.render("allwebinar", { allWebinar, department });
      }
    }
    if (!searchedWebinar.length) {
      //create indexes
      const allWebinar = await Webinar.find(
        { $text: { $search: req.body.courses } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });

      if (allWebinar.length) {
        return res.render("allwebinar", { allWebinar, department });
      }
    }
    res.send("no matches found");
  })
);

module.exports = router;
