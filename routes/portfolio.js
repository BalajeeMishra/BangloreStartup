const express = require("express");
const Portfolio = require("../models/portfolio.js");
const router = express.Router();
const { upload } = require("../helper/multer");

router.get("/all", async (req, res) => {
  const portfolio = await Portfolio.find({});
  res.render("admin/allportfolio", { portfolio });
});

router.get("/", (req, res) => {
  res.render("admin/addportfolio");
});
router.post("/", upload.single("image"), async (req, res) => {
  const newPortfolio = new Portfolio(req.body);
  newPortfolio.image = req.file.filename;
  await newPortfolio.save();
  console.log(newPortfolio);
  res.redirect("/portfolio/all");
});
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findById(id);
  // const users = await User.findById(req.user._id);
  res.render("admin/updateportfolio", { portfolio });
});

router.put("/edit/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  portfolio.image = req.file.filename;
  await portfolio.save();
  res.redirect("/portfolio/all");
});

router.get("/delete_portfolio/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
  req.flash("success", "portfolio deleted");
  res.redirect("/portfolio/all");
});
module.exports = router;
