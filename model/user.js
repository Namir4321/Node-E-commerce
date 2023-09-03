require('dotenv').config();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const UserSchema=new Schema({
    name:{
        type:String,
        required:true,
        },
        email:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
        tokens:[{
            token:{
                type:String,
                required:true,
            }
        }], 
        verified:{
            type:Boolean,
            default:false,
        },
        // prodId:[{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref:"Product",
            
        // }],
        cart: {
            items: [
              {
                productId: {
                  type: Schema.Types.ObjectId,
                  ref: "Product",
                  required: true,
                },
                 price:{
                    type: Number,
                    required: true,  
                },
                title:{
                    type: String,
                    required: true,  
                },
                image:{
                    type:String,
                    required: true,  
                },
                quantity: { type: Number, required: true },
              },
            ],
          },
       });
UserSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
})
UserSchema.methods.generateAuthToken=async function(){
    try{
const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
this.tokens=this.tokens.concat({token:token})
await this.save();
return token
    }catch(error){
console.log(error)
    }
}
UserSchema.methods.addtocart = async function(product) {
        const existing =this.cart.items.find(item=>item.productId.toString()===product._id.toString())
        if(existing){
  let quantity=existing.quantity;
  let price=existing.price;
        console.log("exist")
           existing.quantity=quantity+1;
           existing.price=price*quantity;
            console.log(quantity)
    }else{
console.log("new")
        const addcart = {
            productId:product.id,
            quantity:1,
            title:product.title,
            image:product.image,
            price:product.price,
     };
        this.cart.items.push(addcart);
    }
    await this.save();
  };
UserSchema.methods.addtocartprice = async function(product) {
    let totalPrice = 0;
    let totalQuantity = 0;
    for (const item of this.cart.items) {
      totalPrice += item.price * item.quantity;
      totalQuantity += item.quantity;
    }
    console.log(totalPrice,totalQuantity)
    return { totalPrice, totalQuantity };

};
UserSchema.methods.removeFromCart = async function(prodId) {
console.log(prodId)
for(i=0;i<this.cart.items.length;i++){
    if(this.cart.items[i].id.toString()===prodId.toString())
    remove=this.cart.items.id.toString()
    }
    const deleteone=this.cart.items.pop(remove)
    return delete
    await this.save()
};
module.exports=mongoose.model("User",UserSchema)