const nodemailer = require("nodemailer");
const verify = process.env.URL || "http://localhost:3000";
module.exports.mailForVerify = async (email, token) => {
  const smtp = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "coursetocode55@gmail.com",
      pass: "tcmhbjJxYPkvGC9M",
    },
  });
  const hello = await smtp.sendMail({
    to: email,
    from: "coursetocode55@gmail.com",
    subject: "Mail Verification",
    html: `Click here to verify:  <br> <a href="${verify}/login/${token}">${token}</a>`,
  });
  return hello;
};
