const express = require("express");
const Portfolio = require("../models/portfolio.js");
const router = express.Router();
const { upload } = require("../helper/multer");
const wrapAsync = require("../controlError/wrapAsync.js");

//all portfolio
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const portfolio = await Portfolio.find({});
    res.render("admin/allportfolio", { portfolio });
  })
);

//form for adding portfolio
router.get("/", (req, res) => res.render("admin/addportfolio"));

//upload form portfolio
router.post(
  "/",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const newPortfolio = new Portfolio(req.body);
    if (typeof req.file != "undefined")
      newPortfolio.image.filename = req.file.filename;

    await newPortfolio.save();
    return res.redirect("/portfolio/all");
  })
);

//portfolio editing form
router.get(
  "/edit/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const portfolio = await Portfolio.findById(id);
    return res.render("admin/updateportfolio", { portfolio });
  })
);

//this route will update portfolio.
router.put(
  "/edit/:id",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    if (typeof req.file != "undefined") {
      portfolio.image.filename = req.file.filename;
    }
    await portfolio.save();
    res.redirect("/portfolio/all");
  })
);
// this will delete portfolio
router.get(
  "/delete/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Portfolio.findByIdAndDelete(id);
    req.flash("success", "portfolio deleted");
    return res.redirect("/portfolio/all");
  })
);

module.exports = router;
