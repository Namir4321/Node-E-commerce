const express=require('express');
const router=express.Router();
const ProductControlller=require("../controller/Product")
const isAuth=require('../middleware/auth');
const multer=require('multer');
const Admin=require('../middleware/admin')


let Storage=multer.diskStorage({
    destination:'public/images/',
    filename:(req,file,cb)=>{
      cb(null, Date.now()+'-'+file.originalname)
    }
  })
  let upload=multer({
    storage:Storage
  })
  

router.get('/add-product',isAuth,Admin,ProductControlller.getAddProduct)
router.post('/add-product',Admin,isAuth,upload.single('image'),ProductControlller.postAddProduct)
router.get('/shop-view',isAuth,ProductControlller.getProduct)
router.get('/product-view',ProductControlller.getProducts)
router.get('/product-detail/:id',ProductControlller.getProductdetails)
router.get('/edit-product/:id',Admin,isAuth,ProductControlller.getEditProduct)
router.post('/edit-product/:id',Admin,isAuth,upload.single('image'),ProductControlller.postEditProduct)
router.get('/delete-product/:id',Admin,isAuth,ProductControlller.getDeleteProduct)
router.get('/product-cart',isAuth,Admin,ProductControlller.getcartall)
router.get('/product-cart/:id',isAuth,Admin,ProductControlller.getcart)
router.post('/post-cart-delete',isAuth,Admin,ProductControlller.postremovecart)
router.post("/create-checkout-session",isAuth,Admin,upload.single('image'),ProductControlller.postcheckout)
router.get('/success/:userId/:userPassword',isAuth,Admin,ProductControlller.getorder)
router.get('/orders',isAuth,Admin,ProductControlller.getallorders)
module.exports=router;