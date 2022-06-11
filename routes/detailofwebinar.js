const express = require("express");
const Webinar = require("../models/webinar.js");
const Purchase = require("../models/purchase");
const router = express.Router();
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapAsync");
const { upload } = require("../helper/multer");
const Department = require("../models/department");
const { query } = require("express");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const categories = await Department.find({});
    res.render("admin/webinar_detail_one", { categories });
  })
);

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
router.get(
  "/moredetail",
  wrapAsync(async (req, res) => {
    const detailOfNew = req.session.newWebinarData;
    res.render("admin/webinar_detail_two", { detailOfNew });
  })
);

router.post(
  "/moredetail/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { advantageous, abouttopic, bestfor, agenda } = req.body;
    const webinar = await Webinar.findOneAndUpdate(
      { id },
      { advantageous, abouttopic, bestfor, agenda }
    );
    delete req.session.newWebinarData;
    res.redirect("/");
  })
);

router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { category = "" } = req.query;
    let categoryList = category.split("_");
    let query = { category: { $in: [...categoryList] } };
    const department = await Department.find({});
    const allWebinar = await Webinar.find(category.length ? query : {});
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

router.get(
  "/allnext",
  wrapAsync(async (req, res) => {
    const allWebinar = await Webinar.find({});
    const purchase = await Purchase.find({});
    // order ka shorting idhar hi karna hai.
    res.render("nextdetailofwebinar", { allWebinar, purchase });
  })
);

router.post(
  "/search",
  wrapAsync(async (req, res) => {
    //department wale pe dhyan dena hai sayad alag s allwebinar.ejs jaisa file banana hoga.
    //SAYAD EK CHIJ HANDLE KARNA PAREGA AGAR KOI USER AAYA AUR SEARCH KARTA HAI WEBINAR THEN I THINK WE HAVE TO SHOW ALL WEBINAR
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
