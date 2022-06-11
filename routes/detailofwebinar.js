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
    console.log(categoryList);
    const department = await Department.find({});
    const allWebinar = await Webinar.find(category.length ? query : {});

    if (!req.session.selectedSort) {
      req.session.selectedSort = [];
    }

    let counter = 0;
    var bool = false;
    const selectedSort = req.session.selectedSort;
    res.render("allwebinar", {
      allWebinar,
      department,
      selectedSort,
      bool,
      counter,
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
//searching on the basis of market category
// kam ye karna hai na ki agar kuch dobara se click karta hai to usko basically remove vi karna hai jo dikha rahe hai usme se. ok
// filter ka use karna hai idhar.
//selected rakhna hai.
// iske liye last me socho.
// apan ko na basically check karna hai agar kisi category ko phir se select karte hai to usko remove karna hai from
//req.session.selectedSort as well as from databases.
// router.get(
//   "/onthebasisofCategory",
//   wrapAsync(async (req, res) => {
//     const { category } = req.query;
//     console.log(category, req.query);
//     if (!req.session.selectedSort) {
//       req.session.selectedSort = [];
//     }
//     if (!req.session.allWebinar) {
//       req.session.allWebinar = [];
//     }

//     if (typeof req.body.category == "string") {
//       if (!req.session.times) {
//         req.session.times = 0;
//       }
//       if (req.session.times >= 0) {
//         req.session.times = req.session.times + 1;
//       }
//       const department = await Department.find({});
//       const trimmedCategory = req.body.category.trim();
//       req.session.selectedSort.push(trimmedCategory);
//       const selectedSort = req.session.selectedSort;
//       const allWebinar = await Webinar.find({
//         category,
//         // category: selectedSort[req.session.times - 1],
//       });
//       // console.log("hiii", ...allWebinar);
//       req.session.allWebinar.push(...allWebinar);
//       // console.log("before", req.session.allWebinar);
//       // console.log("after", req.session.allWebinar);
//       req.session.department = department;
//       return res.json({ ...req.body });
//       // return res.redirect("/webinar/searched");
//     }
//   })
// );

// router.get("/searched", (req, res) => {
//   // delete req.session.times;
//   // delete req.session.selectedSort;
//   // delete req.session.allWebinar;
//   const allWebinar = req.session.allWebinar;
//   const department = req.session.department;
//   if (!req.session.selectedSort) {
//     req.session.selectedSort = [];
//   }
//   var bool = false;
//   var selectedSort = req.session.selectedSort;
//   if (selectedSort.length > 0) {
//     console.log("mmmmishhhhhhhh", selectedSort);
//     bool = true;
//   }

//   let counter = 0;
//   return res.render("allwebinar", {
//     allWebinar,
//     department,
//     selectedSort,
//     bool,
//     counter,
//   });
// });

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
