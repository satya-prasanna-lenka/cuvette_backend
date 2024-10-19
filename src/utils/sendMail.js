const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or another email service
  auth: {
    user: process.env.EMAIL_USER || "webtechd7@gmail.com",
    pass: process.env.EMAIL_PASS || "pghtskqoyvbfifyf",
  },
});

module.exports = transporter;
