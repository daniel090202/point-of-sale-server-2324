const express = require("express");
const Router = express.Router();

const { validationResult } = express("express-validator");
const addProductValidator = require("./validators/addProductValidator");

const Product = require("../models/ProductModel");

Router.get("/", (request, response) => {
  Product.find().then((products) => {
    return response.json({
      code: 0,
      message: "Set of products.",
      data: products,
    });
  });
});

Router.post("/", addProductValidator, (request, response) => {
  const result = validatorResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { name, price, description } = request.body;
    const product = new Product({
      name,
      price,
      description,
    });

    product
      .save()
      .then(() => {
        return response.json({
          code: 0,
          message: "Successfully add product.",
        });
      })
      .catch((error) => {
        return response.json({
          code: 2,
          message: error.message,
        });
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

module.exports = Router;
