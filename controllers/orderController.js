const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const ObjectId = mongoose.Types.ObjectId;
const Address = require("../models/addressSchema");
const Product = require("../models/productSchema");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

exports.orders = async (req, res) => {
  let orders = await Order.find({ userId: req.session.user._id })
    .sort("-updatedAt")
    .populate({
      path: "products.item",
      model: "Product",
    })
    .exec();

  console.log(orders[0].products, "ordersssss");

  const cartCount = req.cartCount;
  if (req.session.filterOrders) {
    res.locals.orders = req.session.filterOrders;
    req.session.filterOrders = null;
  } else if (req.session.noOrders) {
    res.locals.orders = req.session.noOrders;
    req.session.noOrders = null;
  } else if (req.session.cancelledOrders) {
    res.locals.orders = req.session.cancelledOrders;
    req.session.cancelledOrders = null;
  } else if (req.session.notShippedOrders) {
    res.locals.orders = req.session.notShippedOrders;
    req.session.notShippedOrders = null;
  } else if (req.session.returneddOrders) {
    res.locals.orders = req.session.returneddOrders;
    req.session.returneddOrders = null;
  } else {
    res.locals.orders = orders;
  }
  res.render("user/OrderView", {
    video: true,
    cartCount,
    user: req.session.user,
  });
};

exports.viewOrderProducts = async (req, res) => {
  let user = req.session.user;
  let order = req.params.id;
  let cond = new ObjectId(order);

  try {
    // Fetch the cart items
    let cartItems = await Order.aggregate([
      {
        $match: { _id: cond },
      },

      {
        $lookup: {
          from: "products",
          localField: "products.item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
    ]);

    // console.log(cartItems[0].products, "💥💥💥");
    // console.log(cartItems[0].productInfo, "hgjhgjhgjhgjhgjhghg");
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    // Add the quantity of each product to the corresponding product object
    cartItems[0].productInfo.forEach((product, index) => {
      product.quantity = cartItems[0].products[index].quantity;
    });

    res.render("user/viewProductDetails", {
      user,
      cartCount,
      products: cartItems[0].productInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

exports.cancelOrder = async (req, res) => {
  let productId = req.query.productId;
  let orderId = req.query.orderId;
  let reason = req.query.reason; // Retrieve the reason from the query parameters
  console.log(
    productId,
    orderId,
    reason,
    "first product, second order, reason"
  );

  let orders = await Order.find({ _id: orderId })
    .populate({
      path: "products.item",
      model: "Product",
    })
    .exec();

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(
      (product) => product.item._id.toString() === productId
    );
    if (product) {
      product.orderstatus = "cancelled";
      product.deliverystatus = "cancelled";
      product.reason = reason; // Assign the reason to the product
      await order.save();
      break; // Exit the loop once product is found
    }
  }
  console.log(orders, "total");
  console.log(product, "I got the product");
  res.redirect("/orders");
};

exports.paymentVerify = async (req, res) => {
  try {
    let details = req.body;
    // console.log(req.body,'hello this is my body')
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "DdoRCQ8YTzkabIFOznw6B8L1");
    hmac.update(
      details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");

    let orderResponse = details["order[receipt]"];
    let orderObjId = new ObjectId(orderResponse);

    if (hmac === details["payment[razorpay_signature]"]) {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("Payment is successful");
      res.json({ status: true });
    } else {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );
      console.log("Payment is failed");
      res.json({ status: false, errMsg: "" });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Internal server error");
  }
};

exports.returnOrder = async (req, res) => {
  let productId = req.query.productId;
  let orderId = req.query.orderId;
  let reason = req.query.reason; // Retrieve the reason from the query parameters
  console.log(productId, orderId, "first pro second order");

  let orders = await Order.find({ _id: orderId })
    .populate({
      path: "products.item",
      model: "Product",
    })
    .exec();

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(
      (product) => product.item._id.toString() === productId
    );
    if (product) {
      product.orderstatus = "returned";
      product.deliverystatus = "returned";
      product.reason = reason; // Assign the reason to the product
      await order.save();
      break; // Exit the loop once product is found
    }
  }
  // console.log(orders,'total')
  // console.log(product,'igot the product')
  res.redirect("/orders");
};

exports.paymentFailed = async (req, res) => {
  res.render("user/paymentFailed", { other: true });
};

exports.orderPlacedCod = (req, res) => {
  let user = req.session.user;

  try {
    res.render("user/OrderPlacedCod");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.invoice = async (req, res) => {
  let productId = req.query.productId;
  let orderId = req.query.orderId;
  console.log(productId, orderId, "first pro second order");

  let orders = await Order.find({ _id: orderId })
    .populate({
      path: "products.item",
      model: "Product",
    })
    .exec();

  console.log(orders, "total");

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(
      (product) => product.item._id.toString() === productId
    );
    if (product) {
      // If product found, fetch the details from the Product model
      break; // Exit the loop once product is found
    }
  }

  console.log(product, "particluar");
  console.log(orders, "total");

  res.render("user/invoice", {
    orders,
    product,
    user: req.session.user,
    other: true,
  });
};
