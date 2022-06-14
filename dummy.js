// const express = require("express")
// const router = express.Router()
// const Webinar = require("./models/webinar")
var pdf = require("html-pdf")
var ejs = require("ejs")
const path = require("path")

let data = {
  purchaseId: 672163,
  date: "22-Aug-2024",
  customer: {
    name: "Balajee Mishra",
    email: "balajeemishra@gmail.com",
    address: "Kaithahi Madhubani BIHAR-847236",
  },
  product: {
    name: "Programming in Python",
    type: "Traning",
    date: Date.now(),
    quantity: 1,
    price: 175,
  },
  totalPrice: 226,
}

const parsedHtml = (htmlPath, data) =>
  ejs.renderFile(htmlPath, data, {}, (err, str) => {
    pdf
      .create(str)
      .toFile(`./public/assets/pdfs/invoice_${Date.now()}.pdf`, (err, data) =>
        console.log(err ? err : data)
      )
  })

const createPdf = (html) =>
  pdf
    .create(html)
    .toFile(`./public/assets/pdfs/invoice_${Date.now()}.pdf`, (err, data) =>
      err ? err : data
    )

try {
  // const webinarDetail = await Webinar.find({})
  let invoice_template_path = path.join(__dirname + "/views/invoice/index.ejs")
  let htmlStr = parsedHtml(invoice_template_path, {
    ...data,
  })

  // console.log(invoice_template_path, htmlStr, "after parsing html...")
  // const invoicePdf = createPdf(htmlStr)
  // console.log(invoicePdf)
} catch (err) {
  console.log(err, "catch block")
}
