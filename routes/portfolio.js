const express = require("express");
const Portfolio = require("../models/portfolio.js");
const router = express.Router();
const { upload } = require("../helper/multer");
//all portfolio
router.get("/all", async (req, res) => {
  const portfolio = await Portfolio.find({});
  res.render("admin/allportfolio", { portfolio });
});
//form for adding portfolio
router.get("/", (req, res) => {
  res.render("admin/addportfolio");
});

//upload form portfolio
router.post("/", upload.single("image"), async (req, res) => {
  const newPortfolio = new Portfolio(req.body);
  if (typeof req.file != "undefined") {
    newPortfolio.image = req.file.filename;
  }
  await newPortfolio.save();
  res.redirect("/portfolio/all");
});

//portfolio editing form
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findById(id);
  // const users = await User.findById(req.user._id);
  res.render("admin/updateportfolio", { portfolio });
});
//this route will update portfolio.
router.put("/edit/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  if (typeof req.file != "undefined") {
    portfolio.image = req.file.filename;
  }
  await portfolio.save();
  res.redirect("/portfolio/all");
});
// this will delete portfolio
router.get("/delete/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
  req.flash("success", "portfolio deleted");
  res.redirect("/portfolio/all");
});
module.exports = router;
