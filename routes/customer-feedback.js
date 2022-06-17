const router = require("express").Router()
const wrapAsync = require("../controlError/wrapAsync")
const ContactForm = require("../models/contactform")
const Email = require("../models/newsLetter")
const { timingFormat } = require("../helper/date")
const { verifyCaptcha } = require("../helper/middleware")

router.post(
  "/",
  wrapAsync(async (req, res, next) => {
    const { name, email, phone, company, industry, message } = req.body
    // Google Captcha Validation
    await verifyCaptcha(req, res)({ path: "training" })
    const dateToEnter = timingFormat(new Date())
    const createdFeedback = new ContactForm({
      name,
      email,
      phone,
      company,
      message,
      industry,
      contact_type: "training",
      date: dateToEnter.dateformattransaction,
    })
    await createdFeedback.save()
    req.flash("success", "Successfully Submitted,we will contact you soon")
    return res.status(200).redirect(req.header("Referer") || "/")
  })
)
// newsletter subscription.
router.post(
  "/newsletter",
  wrapAsync(async (req, res) => {
    const date = timingFormat(new Date())
    const newuserforNewsletter = new Email({
      email: req.body.email,
      date: date.dateformattransaction,
    })
    await newuserforNewsletter.save()
    req.flash("success", "Thanks for subscribing the newsLetter")
    res.redirect("/")
  })
)

router.post(
  "/enquery",
  wrapAsync(async (req, res) => {
    const { name, email, phone, message } = req.body
    await verifyCaptcha(req, res)({ redirect: true })
    const dateToEnter = timingFormat(new Date())
    const createdFeedback = new ContactForm({
      name,
      email,
      phone,
      message,
      contact_type: "enquery",
      date: dateToEnter.dateformattransaction,
    })
    await createdFeedback.save()
    req.flash("success", "Successfully submitted,we will contact you soon")
    return res.status(200).redirect(req.header("Referer") || "/")
  })
)
router.post(
  "/contact",
  wrapAsync(async (req, res) => {
    const { name, email, phone, message } = req.body

    await verifyCaptcha(req, res)({ redirect: true })
    const dateToEnter = timingFormat(new Date())
    const createdFeedback = new ContactForm({
      name,
      email,
      phone,
      message,
      contact_type: "contact",
      date: dateToEnter.dateformattransaction,
    })
    await createdFeedback.save()
    req.flash("success", "Successfully submitted,we will contact you soon")
    return res.status(200).redirect(req.header("Referer") || "/")
  })
)

module.exports = router
