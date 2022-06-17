const { default: axios } = require("axios")

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash("error", "you must be signed in first!")
    return res.redirect("/login")
  }
  next()
}

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin == true) {
    next()
  } else {
    req.flash("error", "Please log in as admin.")
    res.redirect("/user/login")
    // res.redirect('/users/login');
  }
}

// Google reCaptcha Verification
module.exports.verifyCaptcha =
  (req, res) =>
  async ({ path = "home", detail = {}, redirect = false }) => {
    console.log(path)
    const captcha_response = req.body["g-recaptcha-response"]
    const verificaton_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${captcha_response}`

    const { data } = await axios.post(verificaton_url)
    if (!data.success && redirect) {
      console.log(redirect)
      req.flash("captcha_error", "Captcha validation Failed")
      return res.redirect(req.header("Referer") || "/")
    } else if (!data.success) {
      return res.status(400).render(path, {
        ...detail,
        captcha_error: "Captcha validation failed.",
      })
    }
    return console.log(data)
  }
