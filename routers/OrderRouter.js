const express = require("express");
const Router = express.Router();

const { validationResult } = require("express-validator");

const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Customer = require("../models/CustomerModel");
const OrderDetails = require("../models/OrderDetailsModel");

Router.get("/", async (request, response) => {
  const allOrders = await Order.find(
    {},
    {
      attributeToSelect: 1,
      _id: 1,
      customerID: 1,
      createdAt: 1,
      exchange: 1,
      paid: 1,
      total: 1,
      orderDetails: 1,
    }
  );

  if (allOrders.length > 0) {
    return response.json({
      code: 0,
      message: "List of orders.",
      data: allOrders,
    });
  } else {
    return response.json({
      code: 1,
      message: "No orders available.",
    });
  }
});

Router.post("/", async (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const confirmData = JSON.parse(Object.keys(request.body)[0]);

    const { paid, data, total, customer, exchange, account } = confirmData;

    let targetCustomer;

    const isCustomerExisted = await Customer.findOne({ phone: customer.phone });

    if (isCustomerExisted === null) {
      const newCustomer = new Customer({
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
      });

      newCustomer.save();

      targetCustomer = customer;
    } else {
      targetCustomer = customer;
    }

    const orderDetails = [];

    for (const value of data) {
      const product = await Product.findOne({ barcode: value.barcode });

      if (product.amount < value.amount) {
        return response.status(403).json({
          code: 2,
          message: "Product purchased exceeds the available stocks.",
        });
      }

      const orderDetail = new OrderDetails({
        productID: product._id.toString(),
        sale: value.sale,
        amount: value.amount,
      });

      orderDetail.save();

      const remain = product.amount - value.amount;

      if (remain === 0) {
        await Product.updateOne(
          { barcode: product.barcode },
          {
            $set: {
              amount: remain,
              status: 2,
            },
          }
        );
      } else {
        await Product.updateOne(
          { barcode: product.barcode },
          {
            $set: {
              amount: remain,
            },
          }
        );
      }

      orderDetails.push(orderDetail);
    }

    const order = new Order({
      customerID: targetCustomer.phone,
      accountID: account._id,
      total: total,
      paid: paid,
      exchange: exchange,
      orderDetails: orderDetails,
    });

    order.save();

    return response.json({
      code: 0,
      message: "Order completed.",
    });
  } else {
    for (const message in messages) {
      notification = messages[message].msg;
      break;
    }

    return response.json({
      code: 1,
      message: notification,
    });
  }
});

Router.get("/customer", async (request, response) => {
  const { phone } = request.query;

  const allOrders = await Order.find(
    { customerID: phone },
    {
      attributeToSelect: 1,
      _id: 1,
      customerID: 1,
      createdAt: 1,
      exchange: 1,
      paid: 1,
      total: 1,
      orderDetails: 1,
    }
  );

  if (allOrders.length > 0) {
    return response.json({
      code: 0,
      message: "List of orders.",
      data: allOrders,
    });
  } else {
    return response.json({
      code: 1,
      message: "Customer have not purchased before.",
    });
  }
});

Router.get("/details", async (request, response) => {
  const { orderID } = request.query;

  const order = await Order.findOne(
    { _id: orderID },
    {
      attributeToSelect: 1,
      _id: 0,
      customerID: 1,
      createdAt: 1,
      exchange: 1,
      paid: 1,
      total: 1,
      orderDetails: 1,
    }
  );

  const orderDetails = [];

  for (const orderDetail of order.orderDetails) {
    const product = await Product.findOne({
      _id: orderDetail.productID.toString(),
    });

    orderDetails.push({
      product: product.name,
      sale: orderDetail.sale,
      amount: orderDetail.amount,
      total: orderDetail.sale * orderDetail.amount,
    });
  }

  if (order) {
    return response.json({
      code: 0,
      message: "List of order details.",
      data: orderDetails,
    });
  } else {
    return response.json({
      code: 1,
      message: "Customer have not purchased before.",
    });
  }
});

module.exports = Router;
