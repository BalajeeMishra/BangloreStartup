const express = require("express");
const Webinar = require("../models/webinar.js");
const router = express.Router();
const { upload } = require("../helper/multer");
var id;
const Department = require("../models/department");
router.get("/", async (req, res) => {
  const categories = await Department.find({});
  res.render("admin/webinar_detail_one", { categories });
});
router.post("/", upload.single("image"), async (req, res) => {
  const newWebinar = new Webinar(req.body);

  id = Math.floor(1000 + Math.random() * 9000);
  if (typeof req.file != "undefined") {
    newWebinar.image = req.file.filename;
  }
  newWebinar.id = id;
  await newWebinar.save();
  res.redirect("webinar/moredetail");
});
//moredetail pe koi ja hi nhi sakta if piche ka detail add nhi kiya hai..
router.get("/moredetail", async (req, res) => {
  res.render("admin/webinar_detail_two");
});
router.post("/moredetail", async (req, res) => {
  const { advantageous, abouttopic, bestfor, agenda } = req.body;
  // console.log(agenda);
  const newEnteredDetail = await Webinar.findOneAndUpdate(
    { id },
    { advantageous, abouttopic, bestfor, agenda },
    {
      new: true,
    }
  );
  res.redirect("/");
});

router.get("/all", async (req, res) => {
  const allWebinar = await Webinar.find({});
  const department = await Department.find({});
  res.render("allwebinar", { allWebinar, department });
});
router.get("/allnext", async (req, res) => {
  const allWebinar = await Webinar.find({});
  res.render("nextdetailofwebinar", { allWebinar });
});
//searching on the basis of market category
router.post("/onthebasisofCategory", async (req, res) => {
  if (typeof req.body.category == "string") {
    const department = await Department.find({});
    const trimmedCategory = req.body.category.trim();
    console.log(trimmedCategory);
    const allWebinar = await Webinar.find({ category: trimmedCategory });
    // console.log(allWebinar);
    req.session.allWebinar = allWebinar;
    req.session.department = department;
    return res.json(req.body);
    // return res.render("allwebinar", { allWebinar, department });
    // return res.redirect("/webinar/mrityunjay");
  }
  // const allWebinar = await Webinar.find({});
  // res.render("nextdetailofwebinar", { allWebinar });
});

router.get("/searched", async (req, res) => {
  const allWebinar = req.session.allWebinar;
  const department = req.session.department;
  return res.render("allwebinar", { allWebinar, department });
  // console.log(req.body);
});

router.post("/search", async (req, res) => {
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
  if (searchedWebinar.length == 0) {
    //create indexes

    const allWebinar = await Webinar.find(
      { $text: { $search: req.body.courses } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    console.log(allWebinar);
    if (allWebinar.length > 0) {
      return res.render("allwebinar", { allWebinar, department });
    }
  }
  // console.log("balajee", searchedWebinar);
  res.send("no matches found");
});

module.exports = router;
