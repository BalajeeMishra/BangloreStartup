const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { upload } = require("../helper/multer");
const wrapAsync = require("../controlError/wrapAsync.js");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const userdata = await User.findById(req.user._id);
    res.render("userdashboard/userdashboarddata", { userdata });
  })
);

module.exports = router;
