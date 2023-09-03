const express=require('express');
const router=express.Router();
const authController=require('../controller/AuthController');
const isAuth=require('../middleware/auth');
const Admin=require('../middleware/admin')


router.get('/register',authController.getSignUp)
router.get('/login',authController.getLogin);
router.get('/forgot-password',authController.getforgotPassword)
router.get('/reset-password/:id/:token',authController.getResetPassword)
router.get('/logout',isAuth,authController.getLogout);
router.get('/flash',authController.getflash)
router.get('/verfiy/:id/:token',authController.getVerified)
router.get('/home',isAuth,Admin,authController.getHome)
router.get(`/verifyuser/:id/:token`,authController.getVerify);
router.post('/signup',authController.postSignUp)
router.post('/login',authController.postLogin);
router.post('/forgot-password',authController.postforgotPassword)
router.post(`/reset-password/:id/:token`,authController.postResetPassword)
router.post(`/verifyuser/:id/:token`,authController.postVerify);
module.exports=router;