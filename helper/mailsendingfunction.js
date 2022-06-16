const nodemailer = require("nodemailer")
const verify = process.env.URL || "http://test.mrityunjay.xyz:5000/user"

module.exports.mailForVerify = async (email, token) => {
  const smtp = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "chhotu.93153@gmail.com",
      pass: "mhSTbQwInD3t9FaK",
    },
  })

  const hello = await smtp.sendMail({
    to: email,
    from: "chhotu.93153@gmail.com",
    subject: "Mail Verification",
    html: `Click here to verify:  <br> <a href="${verify}/login/${token}">${verify}/${token}</a>`,
  })
  return hello
}

module.exports.mailForForgetpassword = async (email, token) => {
  const smtp = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "chhotu.93153@gmail.com",
      pass: "mhSTbQwInD3t9FaK",
    },
  })
  const hello = await smtp.sendMail({
    to: email,
    from: "chhotu.93153@gmail.com",
    subject: "Mail Verification",
    html: `Click here to verify it's you:  <br> <a href="${verify}/detailforchange/${token}">${token}</a>`,
  })
  return hello
}
