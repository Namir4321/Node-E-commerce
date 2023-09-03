const Admin = require("../middleware/admin");
const Product = require("../model/product");
const Order=require('../model/order')
require('dotenv').config()
const User=require('../model/user')
const isAuth = require("../middleware/auth");
const { find, findOne, findById } = require("../model/user");
const product = require("../model/product");
const { v4: uuidv4 } = require("uuid");
const sessions = require("express-session");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const order = require("../model/order");
exports.getAddProduct = async (req, res, next) => {
  const id=req.params.id;
  res.render("Product/add-product", {
    PageTitle: "Add Product",
    isAuth: true,
    edit:false,
    Admin:false,
    message: req.flash("message"),
    type: req.flash("type"),
  });
};
exports.postAddProduct = async (req, res, next) => {
   const { title, category, price, description } = req.body;
const image=req.file;
   edit=false
  // Check that all required fields are present and not empty
  if (!title || !category || !price || !description || !req.file) {
    req.flash("message", "All fields are required");
    req.flash("type", "danger");
    return res.redirect("/add-product");
  }

  // Check that price is a valid number
  if (isNaN(price)) {
    req.flash("message", "Price must be a valid number");
    req.flash("type", "danger");
    return res.redirect("/add-product");
  }

  const newProduct = new Product({
    // id :uuidv4().toString(),
    title: title,
    category: category,
    image: image ? image.filename : undefined,
    price: price,
    description: description,
    userId: req.user,
  });

  try {
    const savedProduct = await newProduct.save();
   
    req.flash("message", "Product added successfully");
    req.flash("type", "success");
    res.redirect("/home");
  } catch (error) {
    console.log(error);
    req.flash("message", "Error adding product");
    req.flash("type", "danger");
    res.redirect("/add-product");
  }
}

exports.getProducts = async (req, res, next) => {
  try {
    Product.find({}).then((products) => {
      res.render("Product/product-view", {
        PageTitle: "Products",
        isAuth: false,
        edit:false,
        isAdmin: false,
        products,
      });
    });
  } catch (err) {
    console.log(err);
  }
};
exports.getProduct = async (req, res, next) => {
  try {
    Product.find({}).then((products) => {
      res.render("Product/product-view", {
        PageTitle: "Products",
        isAuth: true,
        edit:false,
        isAdmin: false,
        products,
      });
    });
  } catch (err) {
    console.log(err);
  }
};
exports.getProductdetails = async (req, res, next) => {
  const id = req.params.id;
  try {
    Product.findById(id).then((products) => {
      res.render("Product/product-detail", {
        PageTitle: "DETAIL",
        isAuth: false,
        edit:false,
        isAdmin: false,
        products,
      })
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getDeleteProduct=async(req,res,next)=>{
  const id=req.params.id;
  const product=await Product.findById(id);
  if (req.user._id.equals(product.userId)) {
   await Product.findByIdAndDelete(id);
res.redirect('/home')
  }else{
    edit=false;
    res.redirect("/home")
  }
}
exports.getEditProduct=async(req,res,next)=>{
  const id=req.params.id;

  const product=await Product.findById(id);
  if (req.user._id.equals(product.userId)) {
    res.render('Product/add-product',{
          PageTitle: "Edit Product",
          edit:true,
          isAuth: true,
          Admin:true, 
          product:product,
          message: req.flash("message"),
          type: req.flash("type"),
        }
        )

  } else {
req.flash("You are not authenticated to do so")
req.flash("danger")

  }
  }
  
  exports.postEditProduct = async (req, res, next) => {
    const id = req.params.id; 
 
const {title,category,price,description}=req.body
  try {
        const product = await Product.findById(id);
        if (!product) {
          req.flash('message', 'Product not found');
          req.flash('type', 'danger');
          return res.redirect('/add-product');
        }
        if (!req.user._id.equals(product.userId)) {
          req.flash('message', 'You are not authorized to edit this product');
          req.flash('type', 'danger');
          return res.redirect(`/add-product/${id}`);
        }
        product.title = title || product.title;
        product.category = category || product.category;
        product.price = price || product.price;
        product.description = description || product.description;
        
        if (req.file) {
          product.image =  req.file.filename;
        }
        await product.save();
        // req.flash('message', 'Product updated successfully');
        // req.flash('type', 'success');
        res.redirect('/home');
      } catch (err) {
        console.log(err);
        req.flash('message', 'Something went wrong');
        req.flash('type', 'danger');
        res.redirect(`/add-product/${id}`);
      }
}
exports.getcartall=async(req,res,next)=>{
const user=await User.findById(req.user)
const price=await user.addtocartprice(req.user)
  res.render('Product/product-cart',{
    PageTitle:"Cart",
    isAuth:true,
    orders:user.cart.items,
price:price,
})
}
exports.getcart=async(req,res,next)=>{
  const id=req.params.id;
  const product=await Product.findById(id)
const user=await User.findById(req.user)
  const addcart=await user.addtocart(product)
 const price=await user.addtocartprice(product)
 orders=user.cart.items
  res.redirect('/product-cart')
}
exports.postremovecart=async(req,res,next)=>{
  const id=req.body.id;
  checkout=true
  console.log(id)
  const user=await User.findById(req.user._id);
console.log(user.name)
const remove=await user.removeFromCart(id)
  res.redirect('/product-cart')
}
exports.postcheckout=async(req,res,next)=>{
const user=await User.findById(req.user)
const order=user.cart.items
const orderId=user.id
  try{
   
      const lineItems = order.map(order => {
 const title=order.title;
        return  {
          price_data: {
            currency: 'inr',
            product_data: {
              name: order.title,
              images:[order.image],
            },
            unit_amount: order.price*100,
          },
          quantity: order.quantity,
        }
      })
      console.log(lineItems)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:lineItems,
        mode: 'payment',
        success_url: `http://localhost:8000/success/${user.id}/${user.email}`,
        cancel_url: 'http://localhost:8000/cancel',
      });

      res.redirect(303, session.url);
  }catch(error){
    console.log(`the error is ${error}`)
  }

};
exports.getorder = async (req, res, next) => {
  const { userId ,pass} = req.params;
  try {
    const user = await User.findById(userId);
    const products = user.cart.items;
    const orderItems = products.map((item) => {
      return {
        quantity: item.quantity,
        title:item.title,
        image:item.image,
        price:item.price,
        quantity:item.quantity,
        product: { ...item.product },
      };
    });

const order=new Order({
  _id:req.user.id,
  user:{
    email:req.user.email,
    userId:req.user.id
  },
  products:orderItems,
});
console.log(orderItems)

    
    await order.save();
res.redirect('/orders')
  } catch (error) {
    console.log(error);
  }
}
exports.getallorders=async(req,res,next)=>{
  const userId=req.user.id;
try{const order=await Order.findOne({userId:userId});
const product=order.products;
console.log(order)

res.render("Product/yourorder", {
  PageTitle: "Products",
  isAuth: true,
  edit: false,
  isAdmin: true,
  products:product,
});
}catch(error){
  console.log(error)
}
}