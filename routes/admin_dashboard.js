const express = require("express")
const Webinar = require("../models/webinar.js")
const Category = require("../models/department")
const Portfolio = require("../models/portfolio.js")
const router = express.Router()
const { upload } = require("../helper/multer")
const AppError = require("../controlError/AppError")
const wrapAsync = require("../controlError/wrapAsync")
const { timingFormat } = require("../helper/date")
const Cart = require("../models/cart")
const User = require("../models/user.js")
//its admin dashboard route.
router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("admin/dashboard")
  })
)
// all listed webinar
router.get(
  "/allproduct",
  wrapAsync(async (req, res) => {
    const webinar = await Webinar.find({})
    if (!webinar) {
      req.flash("error", "First Enter the detail of webinar.")
      return res.redirect("/webinar")
    }
    return res.render("admin/listedproduct", { webinar })
  })
)
//getting edit form for webinar
router.get(
  "/edit_product/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const webinar = await Webinar.findById(id)
    //below line is to entering the date inside form basically we are extracting the date.
    const dateformat = timingFormat(webinar.webinartiming)
    const datePattern = dateformat.datePattern
    const categories = await Category.find({}).sort("order")
    const portfolio = await Portfolio.find({}).sort("name")
    res.render("admin/editlistedproduct", {
      webinar,
      categories,
      portfolio,
      datePattern,
    })
  })
)
// webinar or seminar get updated with this route..
router.put(
  "/edit_product/:id",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    console.log("balajee", req.body)
    const { id } = req.params
    const webinar = await Webinar.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    })
    if (typeof req.file != "undefined") {
      webinar.image.filename = req.file.filename
    }
    webinar.category = req.body.nameofdepartment
    await webinar.save()
    res.redirect("/admin/allproduct")
  })
)

//updating the visibility of webinar or seminar page.
router.get("/update_the_visibility/:id", async (req, res) => {
  const { id } = req.params
  const webinartoupdate = await Webinar.findById(id)
  await Webinar.findByIdAndUpdate(
    id,
    {
      visibility: !webinartoupdate.visibility,
    },
    {
      runValidators: true,
      new: true,
    }
  )
  // here I am updating visibility cart model for those product that is selected by visibility to true or false.
  await Cart.find({ product: id }).updateMany(
    {},
    { visibility: !webinartoupdate.visibility }
  )
  return res.redirect("/admin/allproduct")
})

//deleting or archiving webinar page;
router.get(
  "/delete_product/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { archive } = req.query
    if (archive) {
      const archiveProduct = await Webinar.findByIdAndUpdate(
        id,
        {
          archive: true,
        },
        {
          runValidators: true,
          new: true,
        }
      )
      return res.redirect("/admin/allproduct")
    }
    const deletedProduct = await Webinar.findByIdAndDelete(id)
    req.flash("success", "webinar  deleted")
    res.redirect("/admin/allproduct")
  })
)
// archive product
router.get("/archive", async (req, res) => {
  const archive = await Webinar.find({ archive: true })
  res.render("admin/archive", { archive })
})

// category or say industry adding page.
router.get(
  "/category",
  wrapAsync(async (req, res) => {
    res.render("admin/add_category")
  })
)
// adding industry in database.
router.post(
  "/add-category",
  wrapAsync(async (req, res) => {
    const newCategory = new Category(req.body)
    await newCategory.save()
    res.redirect("/admin/allcategories")
  })
)
// from here we can see all category page.
router.get(
  "/allcategories",
  wrapAsync(async (req, res) => {
    const category = await Category.find({}).sort("order")
    res.render("admin/allcategory", { category })
  })
)

// by this route we are rendering edit form of industry.
router.get(
  "/edit_category/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    res.render("admin/editcategory", { category })
  })
)
// this will add edited category in database.

router.put(
  "/category/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const category = await Category.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    })

    req.flash("success", "category updated")
    res.redirect("/admin/allcategories")
  })
)
// deleting the category as we want.
router.get(
  "/delete_category/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await Category.findByIdAndDelete(id)
    req.flash("success", "category deleted")
    res.redirect("/admin/allcategories")
  })
)
// for ups and down.
router.get(
  "/upanddownthe_category/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    let { action, position } = req.query
    position = parseInt(position)
    const categories = await Category.find({}).sort("order")
    let [selectedCategory] = categories.filter((doc) => doc._id.equals(id))
    const index = categories.indexOf(selectedCategory)
    console.log(index)
    if (action == 1 && categories[0].order == position) {
      req.flash(
        "error",
        "you can't up the category which is on topmost position."
      )
      return res.redirect("/admin/allcategories")
    }
    if (action == -1 && position == categories[categories.length - 1].order) {
      req.flash(
        "error",
        "you can't down the category that is on last position."
      )
      return res.redirect("/admin/allcategories")
    }
    if (action == 1) {
      var lastindexorder = categories[index - 1].order
    }
    if (action == -1) {
      var nextindexorder = categories[index + 1].order
    }
    var query =
      action == 1
        ? { $or: [{ order: position }, { order: lastindexorder }] }
        : { $or: [{ order: position }, { order: nextindexorder }] }
    const categoryList = await Category.find(query)
    ;[categoryList[0].order, categoryList[1].order] = [
      categoryList[1].order,
      categoryList[0].order,
    ]
    await categoryList[0].save()
    await categoryList[1].save()

    return res.redirect("/admin/allcategories")
  })
)

//updating the visibility of Category or say type of market.
router.get("/update_the_visibility_of_category/:id", async (req, res) => {
  const { id } = req.params
  const categorytoupdate = await Category.findById(id)
  // updating the category.
  await Category.findByIdAndUpdate(
    id,
    {
      visibility: !categorytoupdate.visibility,
    },
    {
      runValidators: true,
      new: true,
    }
  )
  //once the category is updating we have to update all the product with that category with the visibility thing
  await Webinar.find({
    category: categorytoupdate.nameofdepartment,
  }).updateMany({}, { visibility: !categorytoupdate.visibility })
  return res.redirect("/admin/allcategories")
})
// finding all the data of cart with every users
router.get("/cartdata_to_no_purchase", async (req, res) => {
  const cart = await Cart.find({}).populate(["product", "userId"])
  const user = await User.find({}).populate("cart")
  res.render("admin/cartAbandon", { cart, user })
})

module.exports = router
