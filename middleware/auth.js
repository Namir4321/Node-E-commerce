const isAuth=(req,res,next)=>{

    if(req.session.user){

        next();
        return req.user;
    }else{
        var err=new Error("user not logged in")
    res.redirect('/login')
    }

}
module.exports=isAuth;