
const clicked=async(req,res,next)=>{
    try{
        console.log('Route clicked!');
        next();
    }
catch(err){
console.log(err)
}
}
module.exports=clicked;
    