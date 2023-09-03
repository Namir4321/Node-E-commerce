function isAuth(req,res,next){
    if(req.isAuth()){
        req.isAuth=true
        return next();
    }
    res.redirect('/login')
}

