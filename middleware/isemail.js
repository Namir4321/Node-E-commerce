const nodemailer=require('nodemailer');
require('dotenv').config();

let transporter=nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
  service:process.env.SERVICE,
  post:process.env.EMAIL_PORT,
  secure:process.env.SECURE,
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
    }
  });
  let sendMail = (mailOptions)=>{
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
    });
  };
  
  module.exports = sendMail;
  