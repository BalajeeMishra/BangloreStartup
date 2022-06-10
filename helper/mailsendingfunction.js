const nodemailer = require("nodemailer");
const verify = process.env.URL || "http://localhost:3000/user";
module.exports.mailForVerify = async (email, token) => {
  const smtp = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "rashika.80020@gmail.com",
      pass: "Nw17TIFRnB4br2OV",
    },
  });
  const hello = await smtp.sendMail({
    to: email,
    from: "rashika.80020@gmail.com",
    subject: "Mail Verification",
    html: `Click here to verify:  <br> <a href="${verify}/login/${token}">${token}</a>`,
  });
  return hello;
};
module.exports.mailForForgetpassword = async (email, token) => {
  const smtp = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "rashika.80020@gmail.com",
      pass: "Nw17TIFRnB4br2OV",
    },
  });
  const hello = await smtp.sendMail({
    to: email,
    from: "rashika.80020@gmail.com",
    subject: "Mail Verification",
    html: `Click here to verify it's you:  <br> <a href="${verify}/detailforchange/${token}">${token}</a>`,
  });
  return hello;
};
