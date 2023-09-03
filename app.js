require("dotenv").config();
const path=require('path')
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 8000;
const session = require("./middleware/session");
const User = require("./model/user");
const flash = require("connect-flash");
const multer=require('./routes/Product');
const Admin=require('./middleware/admin')
const bodyParser = require("body-parser");
const authroute = require("./routes/route");
const Productroute=require('./routes/Product')
app.set("view engine", "ejs");
app.set("views", "views");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(session);
app.use(multer);
app.use("/", authroute);
app.use( Productroute);
app.use(Admin)

mongoose.connect("mongodb://localhost:27017/sessionAuthentication")
.then(result => {
  app.listen(port);
})
.catch(err => {
  console.log(err);
});
