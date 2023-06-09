const Wishlist = require("../models/wishlistSchema");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Product = require("../models/productSchema");
const Wallet = require("../models/walletSchema");
const Order = require("../models/orderSchema");

exports.wishListPage = async (req, res) => {
  // Access cartCount value from req object
  const cartCount = req.cartCount;
  try {
    if (req.session.user) {
      const wishItems = await Wishlist.findOne({
        user_id: req.session.user._id,
      }).populate("products.product_id");
      console.log(wishItems, "................");
      if (!wishItems) {
        // Handle the case when no wishlist is found
        //console.log(wishItems,'newone')

        return res.render("user/wishList", {
          user: req.session.user,
          cartCount,
        });
      } else {
        // console.log(wishItems,'wishisi')
        return res.render("user/wishList", {
          wishItems,
          user: req.session.user,
          cartCount,
        });
      }
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.addToWishList = async (req, res) => {
  try {
    if (req.session.user) {
      let prdId = new ObjectId(req.params.id);
      console.log(prdId, "////////////////////");
      let proItmes = {
        product_id: prdId,
      };
      console.log(proItmes, "????????");
      let wishListItem = await Wishlist.findOne({
        user_id: req.session.user._id,
      });

      console.log(wishListItem, "wish lsit");
      if (wishListItem) {
        const productIndex = wishListItem.products.findIndex(
          (product) => String(product.product_id) === String(prdId)
        );
        console.log(productIndex, "value of exist or not");

        if (productIndex !== -1) {
          return res.json({ status: false });
        } else {
          await Wishlist.updateOne(
            { user_id: req.session.user._id },
            { $push: { products: proItmes } }
          );
          return res.json({ status: true });
        }
      } else {
        const newItem = new Wishlist({
          user_id: req.session.user._id,
          products: [proItmes],
        });
        await Wishlist.create(newItem);
        return res.json({ status: true });
      }
    } else {
      console.log("hello");
      return res.json(false);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    let productIdToRemove = req.params.id;
    let updatedDoc = await Wishlist.findOneAndUpdate(
      { user_id: req.session.user._id },
      { $pull: { products: { product_id: productIdToRemove } } },
      { new: true }
    );
    console.log(updatedDoc);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error);
  }
};

exports.wishlistToProDetails = async (req, res) => {
  try {
    let user = req.session.user;
    let productIdToRemove = req.params.id;
    console.log(productIdToRemove);

    // Access cartCount value from req object
    const cartCount = req.cartCount;
    //   let updatedDoc =  await Wishlist.findOneAndUpdate(
    //     { user_id: req.session.user._id },
    //     { $pull: { products: { product_id: productIdToRemove } } },
    //     { new: true }
    //   );
    //   console.log(updatedDoc)
    const singleProduct = await Product.findOne({ _id: req.params.id });
    console.log(singleProduct);
    res.render("user/oneproduct", { singleProduct, cartCount, user });
  } catch (error) {
    console.log(error);
  }
};


exports.walletPage = async (req, res) => {
  try {
    const cartCount = req.cartCount;

    if (!req.session.user) {
      return res.redirect("/login");
    }

    const userId = req.session.user._id;

    let walletItems = await Wallet.findOne({ userId });

    if (!walletItems) {
      walletItems = new Wallet({
        userId,
        balance: 0,
      });
    }

    const balance = walletItems.balance;
    console.log(balance);

    res.render("user/wallet", {
      user: req.session.user,
      cartCount,
      balance,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
