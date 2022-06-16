const router = require("express").Router()
const Webinar = require("../models/webinar.js")
const Department = require("../models/department")
const Purchase = require("../models/purchase")

const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")

router.get(
  "/all",
  wrapAsync(async (req, res) => {
    const { category = "", status = "" } = req.query
    let categoryList = category.split("_")
    let query = { visibility: true, types: "Seminar" }
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

// home page category route all data webinar and seminar.
router.get("/webinar", async (req, res) => {
  const { category } = req.query
  const webinar = await Webinar.find({ category })
  return res.send(webinar)
})

// route for show-page.
router.get("/s/:id", async (req, res) => {
  const { agenda = false } = req.query
  const seminar = await Webinar.findById(req.params.id).populate("portfolio")
  console.log(seminar)
  if (!seminar?.visibility) {
    req.flash("error", "This webinar is not available")
    return res.redirect("/seminar/all")
  }
  req.session.backUrl = req.originalUrl
  // payment options
  const purchases = await Purchase.find({}).sort("order")
  return res.status(200).render("seminar", { seminar, purchases, agenda })
})

module.exports = router
