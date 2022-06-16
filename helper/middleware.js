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
module.exports.verifyCaptcha = async (captcha_response) => {
  const verificaton_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${captcha_response}`

  const { data } = await axios.post(verificaton_url)

  return data
}
