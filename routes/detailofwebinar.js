const express = require("express")
const router = express.Router()

const Webinar = require("../models/webinar.js")
const Purchase = require("../models/purchase")
const Department = require("../models/department")
const Portfolio = require("../models/portfolio.js")

const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")

const { upload } = require("../helper/multer")
const {
  timingFormat,
  addtimeinAmPmFormat,
  firsttwomonthfromnow,
} = require("../helper/date")

// add the detail of webinar.
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const categories = await Department.find({}).sort("order")
    if (!categories) {
      req.flash("error", "First enter the field of market categories")
      return res.redirect("/admin/category")
    }
    return res.render("admin/webinar_detail_one", { categories })
  })
)

// adding the first page of webinar form here in database.
router.post(
  "/",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const { webinartiming, time } = req.body
    const newWebinar = new Webinar(req.body)
    if (typeof req.file != "undefined") {
      newWebinar.image = { name: req.file.filename, url: req.file.path }
    }
    if (webinartiming) {
      const dateformat = timingFormat(webinartiming)
      const datePattern = dateformat.givenDateShowpage
      newWebinar.showingDate = datePattern
      newWebinar.dateforSort = dateformat.monthandyear
    }
    if (time) {
      const timeinFormat = addtimeinAmPmFormat(time)
      newWebinar.addtimingineastern = timeinFormat.eastern
      newWebinar.addtiminginpacific = timeinFormat.pacific
    }
    const newWebinarcollected = await newWebinar.save()
    req.session.newWebinarData = newWebinarcollected
    res.redirect("/webinar/moredetail")
  })
)
//moredetail pe koi ja hi nhi sakta if piche ka detail add nhi kiya hai..
// rendering the form of 2nd page of webinar.
router.get(
  "/moredetail",
  wrapAsync(async (req, res) => {
    const detailOfNew = req.session.newWebinarData
    res.render("admin/webinar_detail_two", { detailOfNew })
  })
)

// adding the 2nd page detail in databases.
router.post(
  "/moredetail/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const { advantageous, abouttopic, bestfor, agenda } = req.body
    console.log(advantageous)
    await Webinar.findOneAndUpdate(
      { id },
      { advantageous, abouttopic, bestfor, agenda }
    )
    delete req.session.newWebinarData
    return res.redirect("/admin/")
  })
)
// all webinar and seminar route for user.
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { category = "", month = "" } = req.query
    let categoryList = category.split("_")

    let query = {}
    if (category.length) query.category = { $in: [...categoryList] }
    if (month.length && typeof month == "string") {
      if (month === "current") {
        query.dateforSort = firsttwomonthfromnow().currentMonth
      }
      if (month === "next") {
        query.dateforSort = firsttwomonthfromnow().firstmonthfromnow
      }
      if (month === "nextofnext") {
        query.dateforSort = firsttwomonthfromnow().secondmonthfromnow
      }
    } else if (month.length) {
      let dateforSort = []
      if (month.includes("current")) {
        dateforSort = [...dateforSort, firsttwomonthfromnow().currentMonth]
      }
      if (month.includes("next")) {
        dateforSort = [...dateforSort, firsttwomonthfromnow().firstmonthfromnow]
      }
      if (month.includes("nextofnext")) {
        dateforSort = [
          ...dateforSort,
          firsttwomonthfromnow().secondmonthfromnow,
        ]
      }
      query.dateforSort = { $in: dateforSort }
    }

    const department = await Department.find({}).sort("order")
    // I want to ask ki what will be your order on the basis of sort.
    const allWebinar = await Webinar.find(query).sort({
      time: "1",
      webinartiming: "-1",
    })

    // added by me.
    if ((category.length || month.length) && !allWebinar.length) {
      req.flash("error", "No match found for selected criteria.")
      return res.redirect("/webinar/all")
    }

    if (!allWebinar.length) {
      req.flash(
        "error",
        "Our store is empty right now, explore other section for now"
      )
      return res.redirect("/")
    }

    return res.render("allwebinar", {
      allWebinar,
      department,
      categoryList,
    })
  })
)

// just view the detail route of any webinar or seminar.
router.get(
  "/allnext/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const webinar = await Webinar.findById(id)
    const purchases = await Purchase.find({}).sort("order")
    const instuctor = await Portfolio.find({})
    return res.render("nextdetailofwebinar", { webinar, purchases })
  })
)

// serching of product.
// searching wale ka bhi sorting karna hai.
router.post(
  "/search",
  wrapAsync(async (req, res) => {
    const department = await Department.find({}).sort("order")
    str = '"' + req.body.courses + '"'
    str1 = "'" + str + "'"
    let searchedWebinar = []
    if (str1.trim().indexOf(" ") != -1) {
      searchedWebinar = await Webinar.find({
        $text: { $search: str1 },
      })
      if (searchedWebinar.length > 0) {
        const allWebinar = searchedWebinar
        return res.render("allwebinar", { allWebinar, department })
      }
    }
    if (!searchedWebinar.length) {
      //create searching
      const allWebinar = await Webinar.find(
        { $text: { $search: req.body.courses } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } })

      if (allWebinar.length) {
        return res.render("allwebinar", { allWebinar, department })
      }
    }
    res.send("no matches found")
  })
)

module.exports = router
