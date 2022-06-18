const express = require("express")
const Webinar = require("../models/webinar.js")
const Purchase = require("../models/purchase")
const router = express.Router()
const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync.js")
const { upload } = require("../helper/multer")
const Department = require("../models/department")
const Portfolio = require("../models/portfolio.js")
const {
  timingFormat,
  addtimeinAmPmFormat,
  firsttwomonthfromnow,
} = require("../helper/date")

// add the first page detail of webinar.
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const categories = await Department.find({}).sort("order")
    const portfolio = await Portfolio.find({}).sort("name")
    if (!portfolio) {
      req.flash("error", "First enter the detail of atleast one instructor")
      return res.redirect("/portfolio")
    }
    if (!categories) {
      req.flash("error", "First enter the field of market categories")
      return res.redirect("/admin/category")
    }
    return res.render("admin/webinar_detail_one", { categories, portfolio })
  })
)

// adding the first page of webinar form here in database.
router.post(
  "/",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const { webinartiming, time } = req.body
    // console.log({ ...req.body });
    const lastWebinar = await Webinar.find({})
    if (lastWebinar.length) {
      var id = lastWebinar[lastWebinar.length - 1].webinarId
    }
    const newWebinar = new Webinar(req.body)
    const portfolio = await Portfolio.findOne({ name: req.body.name })
    newWebinar.portfolio = portfolio._id
    if (typeof req.file != "undefined") {
      newWebinar.image.filename = req.file.filename
    }

    // now adding the webinar id,we will show that on user interface.
    // below line is just for showing special type of date format on frontend(for user purpose).
    if (webinartiming) {
      const dateformat = timingFormat(webinartiming)
      const datePattern = dateformat.givenDateShowpage
      newWebinar.showingDate = datePattern
      newWebinar.dateforSort = dateformat.monthandyear
    }
    // here I am basically entering the time of estern and western inside a webinar schema.
    if (time) {
      const timeinFormat = addtimeinAmPmFormat(time)
      newWebinar.addtimingineastern = timeinFormat.eastern
      newWebinar.addtiminginpacific = timeinFormat.pacific
    }
    newWebinar.webinarId = !id ? 108 : id + 1
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
    await Webinar.findOneAndUpdate(
      { id },
      { advantageous, abouttopic, bestfor, agenda }
    )
    delete req.session.newWebinarData
    await req.session.save()
    res.redirect("/admin")
  })
)
// all webinar and seminar route for user.
router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { category = "", status = "" } = req.query
    let categoryList = category.split("_")
    let query = { visibility: true, types: "Webinar" }
    if (category.length) query.category = { $in: [...categoryList] }
    if (status.length) query.status = { $in: [status] }
    const department = await Department.find({}).sort("order")
    // i want to ask ki what will be your order on the basis of sort.
    const allWebinar = await Webinar.find(query)
      .sort({
        status: "1",
        time: "1",
        webinartiming: "-1",
      })
      .populate("portfolio")

    // added by me.
    if (!allWebinar.length) {
      req.flash(
        "error",
        "We haven't added product,explore other section for now"
      )
      return res.redirect("/")
    }
    // just for handling something.

    if (!allWebinar.length) {
      req.flash("error", "No match found")
      return res.redirect("/webinar/all")
    }
    return res.render("allwebinar", {
      allWebinar,
      department,
      categoryList,
    })
  })
)

// for finding monthwise data for 2 month from this month.
router.get("/monthwise", async (req, res) => {
  const monthFormat = firsttwomonthfromnow()
  const webinar = await Webinar.find({
    dateforSort: monthFormat.secondmonthfromnow,
  })
  res.send(webinar)
})

// just view the detail route of any webinar or seminar.
router.get(
  "/allnext/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const webinar = await Webinar.findById(id).populate("portfolio")
    if (!webinar?.visibility) {
      req.flash("error", "This webinar is not available")
      return res.redirect("/webinar/all")
    }
    req.session.backUrl = req.originalUrl
    // payment options...
    const purchases = await Purchase.find({}).sort("order")
    res.render("nextdetailofwebinar", { webinar, purchases })
  })
)

// serching of product.
// searching wale ka bhi sorting karna hai.
router.post(
  "/search",
  wrapAsync(async (req, res) => {
    const department = await Department.find({}).sort("order")
    if (!req.body.courses) {
      req.flash("error", "No match found")
      return req.redirect("/")
    }

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
