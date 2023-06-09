var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");
const addressController = require("../controllers/addressController");
const Product = require("../controllers/productController");
const wishlistController = require("../controllers/wishlistController");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const couponControllers = require("../controllers/couponControllers");
const {userauth,verify} = require('../middleware/user')


/* GET users listing. */
router.get("/home", verify, cartController.cartCount, userController.home);
router.get("/", userauth, cartController.cartCount, userController.home);
router.get("/login", userauth, userController.login);
router.get("/otpLogin", userauth, userController.getSignOtpIn);
router.get("/about", cartController.cartCount, userController.about);
router.get("/product", cartController.cartCount, userController.product);
router.get("/account", verify, userController.profile);
router.get("/blog", cartController.cartCount, userController.blog);
router.get("/contact", cartController.cartCount, userController.contact);
router.get("/signUp", userauth, userController.signUp);
router.get("/forgrtPassword", userauth, userController.forgetPassword);
router.get("/OTP", userauth, userController.OTP);
router.get("/logout", userController.logout);
router.get("/oneproduct/:id",cartController.cartCount,userController.oneproduct);
router.get("/categoryview/:id",userController.categoryview)
router.get("/Men", cartController.cartCount, userController.Men);
router.get("/Women", cartController.cartCount, userController.Women);
router.post("/signup", userController.postSignup);
router.post("/login", userController.postLogin);
router.post("/sendotp", userController.sendOtp);
router.post("/verifyotp", userController.verifyOtp);
router.post("/emailexists", userController.emailVerify);
router.post("/verifyotpLogin", userauth, userController.verifyMobileOtp);
router.patch("/verifyMobileOtpwithforget",userauth,userController.verifyMobileOtpwithforget);
router.post("/mobileexists", userController.mobileVerify);
router.patch("/resetPassword", userController.resetPassword);
router.get("/filter-products",userController.filterproducts)
router.get('/shop/search/suggestions/',userController.search)
router.get('/search',userController.searching)

//cart

router.get("/addtocart/:id",cartController.cartCount,cartController.addtoCart); 
//userController.isLogin,
router.get("/cart",cartController.cartCount,cartController.getCartProducts,userController.shopping_cart);
router.post("/changeProductQuantity", cartController.changeProductQuantity);
router.post("/removeItem", cartController.removeItem);
router.get("/product-size-selector", cartController.productSizeSelector);

//checkout
router.get("/address", addressController.deliveryAddress);
router.post("/address", addressController.deliveryAddressPost); // url for check out page
//user saved address
router.get("/savedAddress",cartController.cartCount,addressController.savedAddressget);
router.post("/savedAddress", addressController.savedAddressPost);
router.get("/editSavedAddress/:id",cartController.cartCount,addressController.editSavedAddress);
router.post("/editSavedAddress/:id", addressController.editSavedAddressPost);
router.delete("/deleteAddress/:id", addressController.deleteAddress);

//order
router.get("/orderPlaced", orderController.orderPlacedCod);
router.get("/Orders", cartController.cartCount, orderController.orders);
router.get("/viewOrderProducts/:id",cartController.cartCount,orderController.viewOrderProducts);
router.get("/cancel-order/", orderController.cancelOrder);
router.get("/return-order/", orderController.returnOrder);
router.get("/invoice/", orderController.invoice);
//razor pay
router.post("/verify-payment", orderController.paymentVerify);
router.get("/payment-failed", orderController.paymentFailed);
//whishlist
router.get("/wishlist", wishlistController.wishListPage);
router.get("/add-to-wishlist/:id", wishlistController.addToWishList);
router.get("/wishlist/:id", wishlistController.removeFromWishlist);
router.get("/wishlist-to-cart/:id", wishlistController.wishlistToProDetails);

//coupon
router.post("/apply-coupon", couponControllers.applyCoupon);

//wallet
router.get("/wallet", wishlistController.walletPage);
module.exports = router;
