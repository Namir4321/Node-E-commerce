const { findById } = require('../model/user')
const User=require('../model/user');
const isAuth = require('./auth');
const session=require('../middleware/session')
const Admin=async(req,res,next)=>{
try{

  if(req.session.user){
    const userId=req.session.user._id;
    const user= await User.findById(userId);
    if(user){
      req.user=user;
      next();
  }  
}else{
  
  next();
}
}catch(err){
    console.log(err)
}
}

module.exports=Admin;

