const router = require("express").Router()

const wrapAsync = require("../controlError/wrapAsync")
const ContactForm = require("../models/contactform")

router.post(
  "/",
  wrapAsync(async (req, res) => {
    const { name, email, phone, company, industry, message } = req.body

    const createdFeedback = new ContactForm({
      name,
      email,
      phone,
      company,
      message,
      industry,
      contact_type: "training",
    })
    await createdFeedback.save()
    return res.status(200).redirect(req.url)
  })
)

module.exports = router
