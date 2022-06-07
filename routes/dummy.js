const express = require("express");
const router = express.Router();
const Webinar = require("../models/webinar");
var pdf = require("html-pdf");
var ejs = require("ejs");
const path = require("path");
router.get("/", async (req, res) => {
  const webinarDetail = await Webinar.find({});
  // const pdfName = webinarDetail[0].pdf_path;
  // if (pdfName) {
  //   return res.render("pdfshow.ejs", { fileName: pdfName });
  // }
  const fileName = "balajeemishra" + Date.now() + ".pdf";
  const data = {
    currentUser: "balajee mishra",
    success: 0,
    error: 0,
    payment: webinarDetail[0],
  };
  console.log(__dirname);
  var m = __dirname.slice(0, __dirname.length - 7);
  ejs.renderFile(
    path.join(__dirname.slice(0, __dirname.length - 7), "views/pdfDetail.ejs"),
    data,
    {},
    function (err, str) {
      if (err) {
        console.log(err);
        return res.send(err).status(400);
      }

      // str now contains your rendered html
      pdf.create(str).toFile(`${m}/public/${fileName}`, function (err, data) {
        if (err) return res.send(err);
        // Dues.findOneAndUpdate(
        //   { userId: req.user._id },
        //   { pdf_path: fileName },
        //   { upsert: true },
        //   async function (err, doc) {
        //     if (err) return res.send(500, { error: err });
        //     return res.render("paymentShow.ejs", { fileName });
        //   }
        // );
      });
    }
  );
});
module.exports = router;
