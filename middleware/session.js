const session=require('express-session');
require('dotenv').config();
module.exports=session({
 name: "real-cookie",
secret: process.env.SECRET_KEY,
saveUninitialized: false,
resave: false,
cookie: {
  httpOnly: true,
  secure: false,
  maxAge: 236464 * 100,

}});