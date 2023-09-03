const User = require("../model/user");
const bcrypt = require("bcryptjs");
const Product=require('../model/product')
const mailer=require('../middleware/isemail')
const jwt=require('jsonwebtoken')
exports.getLogin = (req, res, next) => {
  res.render("login", {
    PageTitle: "Login",
    isAuth:false,
    message: req.flash("message"),
    type: req.flash("type")
  });
};

exports.getHome = async (req, res, next) => {
  try {

    // const product=await Product.findById(id)
    // if (req.user._id.equals(product.userId)) {
    Product.find({}).then((products) => {
      res.render("Product/product-view", {
        PageTitle: "Admin",
        isAuth: true,
        edit:true,
        isAdmin: true,
        products,
      });
    });
  }
   catch (err) {
    console.log(err);
  }

};
exports.getSignUp = (req, res, next) => {
  res.render("register", {
    PageTitle: "register",
    isAuth:false,
    edit:false,
    message: req.flash("message"),
    type: req.flash("type")
  });
};
exports.getforgotPassword = (req, res, next) => {
  res.render("FORGOT-PASSWORD", {
    PageTitle: "forgot-password",
    isAuth:false,
    edit:false,
    message: req.flash("message"),
    type: req.flash("type")
  });
};

exports.getResetPassword= async(req,res,next) => {
  const {id,token}=req.params;
  const user= await User.findById(id)
  const secret=user._id + process.env.SECOUND_SECRET_KEY;
  const tokener=jwt.sign({userId:user._id},secret,{
    expiresIn:'15m'
  })
  try{
res.render('reset-password',{
  PageTitle:"RESET-PASSWORD",
  isAuth:false,
  edit:false,
  message:req.flash('message'),
  type: req.flash("type")
})
  }catch(error){
    console.log(error)
  }
}

exports.postSignUp=async(req,res,next)=>{
  isAuth=false
  const {name,email,password,confirm}=req.body;
  const user=await User.findOne({email:email})
  if(!user){
  if(name&&password&&email&&confirm){
  if(password===confirm){
  const newUser=new User({
  name:name,
  email:email,
  password:password,
  confirm:confirm,
  })
  
  const token=await newUser.generateAuthToken();
  const user=await User.findOne({email:email})
  res.redirect('/login')
  if(user){
    const secret=user._id + process.env.SECOUND_SECRET_KEY;
    const tokener=jwt.sign({userId:user._id},secret,{
      expiresIn:'1h'
    })
    const verifylink = `http://localhost:8000/verifyuser/${user._id}/${tokener}`
    mailer({
      from: process.env.EMAIL_USER, // sender address
      to: user.email, // list of receivers
      subject: "just trying", // Subject line
      html: `<a href="${verifylink}">link text</a>`, // html body
  });
  console.log(verifylink)
  }
  
  const userlist=newUser.save();
  // res.redirect('/login')
  }else{
    req.flash("message", "password and confirm password doesn't match");
    req.flash("type","danger")   
    res.redirect("/register");
  }
  }else{
    req.flash("message", "every field is required");
    req.flash("type","danger")  
    res.redirect("/register");
       }
  }else{
    req.flash("message", "email already exist");
    req.flash("type","danger")
    res.redirect("/register");
    }
  }
  
  
exports.postLogin = async (req, res, next) => {
  isAuth=false
  const {email,password}=req.body;
  if(email&&password){
const user=await User.findOne({email:email})
if(user){
const isMatch=await bcrypt.compare(password,user.password)
if(isMatch){
  if( user.verified===true){
    req.session.user=user;
    res.redirect('/home')
  }else{
    const secret=user._id + process.env.SECOUND_SECRET_KEY
      const tokener=jwt.sign({userId:user._id},secret,{
        expiresIn:'15m'
      })
      const verifylink = `http://localhost:8000/verifyuser/${user._id}/${tokener}`
      mailer({
        from: process.env.EMAIL_USER, // sender address
        to: user.email, // list of receivers
        subject: "just trying", // Subject line
        html: `<a href="${verifylink}">link text</a>`, // html body
    });
    console.log(verifylink)
    req.flash("message","verify yourself mail sent")
    req.flash("type","success")
    res.redirect("/login")
    
  }
}else{
  req.flash("message","email and password is incorrect")
  req.flash("type","danger")
    res.redirect('/login')
}
}else{
  req.flash("message","register yourself")
  req.flash("type","danger")
  res.redirect("/login")
}
  }else{
    req.flash("message","Please input both email and password")
    req.flash("type","danger")
    res.redirect('/login')
  }
};

exports.getLogout = (req, res, next) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie("real-cookie");
        req.session = null;

        res.cookie("real-cookie", "", { expires: new Date(0) });

        res.redirect("/login");
      }
    });
  }
};

exports.getflash = async (req, res, next) => {
  req.flash("message", "message","type","type");
  next();
};



exports.postforgotPassword = async(req, res, next) => {
  const{email}=req.body;
  if(email){
      const user=await User.findOne({email:email})
      if(user){
       const secret=user._id + process.env.SECOUND_SECRET_KEY
   const tokener =jwt.sign({userId:user._id},secret,{
     expiresIn:'15m'
   })
 
     const link = `http://localhost:8000/reset-password/${user._id}/${tokener}`
   // send email
// mailer({
//        from: process.env.EMAIL_USER, // sender address
//        to: user.email, // list of receivers
//        subject: "just trying", // Subject line
//        html: `<a href="${link}">link text</a>`, // html body
//    });
   console.log(link)
   req.flash("message", "email send sucessfully");
   req.flash("type","success");
   res.redirect("/forgot-password");

}else{
  req.flash("message", "email doesn't exist");
  req.flash("type","danger")
  res.redirect("/forgot-password");
}
}else{
  req.flash("message", "email filed is required");
  req.flash("type","danger")
  res.redirect("/forgot-password");
}
}

exports.postResetPassword=async(req,res,next)=>{
  const { password, confirm } = req.body;
  const { id, token } = req.params;

  const user= await User.findById(id)
  const secret=user._id + process.env.SECOUND_SECRET_KEY;
  const tokener=jwt.sign({userId:user._id},secret,{
    expiresIn:'15m'
  })
  const decoded=await jwt.verify(tokener,secret)
  
  try{
    if(decoded.userId==user._id){
      if(password || confirm){
      if(password===confirm){
        const hashedPassword = await bcrypt.hash(password, 10);
          await User.findByIdAndUpdate(user._id, { password: hashedPassword });
          // return res.status(200).send({ status: "success", message: "Password reset successfully" });
        res.redirect('/login')
      }else{
        req.flash("message", "Password and confirm password do not match");
        req.flash("type","danger")
        res.redirect("/reset-password"); 
      }
      }else{  
        req.flash("message", "Both password and confirm fields are required");
        req.flash("type","danger")
        res.redirect("/reset-password");}
      }else{
        req.flash("message", "Invalid Token");
        req.flash("type","danger")
        res.redirect("/reset-password");}
          
  }catch(error){
    console.log(error)
  }
}



exports.getVerified=async(req,res,next)=>{
  const { id, token } = req.params;

  const user= await User.findById(id)
  const secret=user._id + process.env.SECOUND_SECRET_KEY;
  const tokener=jwt.sign({userId:user._id},secret,{
    expiresIn:'15m'
  })
  const decoded=await jwt.verify(tokener,secret)
  try{
    res.render('verifiyuser',{
       PageTitle:"RESET-PASSWORD",
  isAuth:false,
  message:req.flash('message'),
  type: req.flash("type")

    }
    
    )

  }catch(err){
    console.log(err)
  }
}

exports.getVerify=async(req,res,next)=>{
  const {id,token}=req.params;
  const user=await User.findById(id)
  // console.log(user)
  if(id!==user.id){
    res.send('Invalid id')
    return;
  }
  const new_secret=user._id + process.env.SECOUND_SECRET_KEY
  jwt.verify(token,new_secret)
  try{
  
res.render('verifyuser',{
  PageTitle:'VERIFY YOURSELF',
  isAuth:false,
  type: req.flash("type"),
  message:req.flash("message")
})

    }catch(error){
      console.log(error)
    }


}
exports.postVerify=async(req,res,next)=>{
const {id,token}=req.params;
const user=await User.findById(id);
const secret=user._id + process.env.SECOUND_SECRET_KEY
const tokener=jwt.sign({userId:user._id},secret,{
  expiresIn:"5m"
})
// console.log(`the tokener is ${tokener}`)
// console.log(`the tokener is ${token}`)
if(user){
  const decoded=await jwt.verify(tokener,secret)
// console.log(decoded)
if(decoded){
await User.findByIdAndUpdate(user._id,{verified:true})
res.redirect('/login')
}
}else{
  res.send({"status":"failed","message":"not associated with us"})
}
}