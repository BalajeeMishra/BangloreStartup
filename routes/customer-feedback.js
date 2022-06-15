const router = require("express").Router();
const wrapAsync = require("../controlError/wrapAsync");
const ContactForm = require("../models/contactform");
const Email = require("../models/newsLetter");
const { timingFormat } = require("../helper/date");
router.post(
  "/",
  wrapAsync(async (req, res) => {
    const { name, email, phone, company, industry, message } = req.body;
    const dateToEnter = timingFormat(new Date());
    const createdFeedback = new ContactForm({
      name,
      email,
      phone,
      company,
      message,
      industry,
      contact_type: "training",
      date: dateToEnter.dateformattransaction,
    });
    await createdFeedback.save();
    req.flash("Success", "Successfully Submitted,we will contact you soon");
    return res.status(200).redirect(req.url);
  })
);
// newsletter subscription.
router.post(
  "/newsletter",
  wrapAsync(async (req, res) => {
    const date = timingFormat(new Date());
    const newuserforNewsletter = new Email({
      email: req.body.email,
      date: date.dateformattransaction,
    });
    await newuserforNewsletter.save();
    req.flash("success", "Thanks for subscribing the newsLetter");
    res.redirect("/");
  })
);

module.exports = router;
