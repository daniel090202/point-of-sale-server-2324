const express = require("express");
const Router = express.Router();

const { validationResult } = require("express-validator");
const addProductValidator = require("./validators/addProductValidator");

const Product = require("../models/ProductModel");

Router.get("/", async (request, response) => {
  const products = await Product.find(
    {},
    {
      attributeToSelect: 1,
      _id: 0,
      barcode: 1,
      name: 1,
      category: 1,
      brand: 1,
      model: 1,
      color: 1,
      ram: 1,
      weight: 1,
      amount: 1,
      year: 1,
      original: 1,
      sale: 1,
      status: 1,
    }
  );

  return response.json({
    code: 0,
    message: "List of products.",
    data: products,
  });
});

Router.post("/add", addProductValidator, (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const {
      barcode,
      name,
      category,
      brand,
      model,
      color,
      ram,
      weight,
      amount,
      year,
      original,
      sale,
    } = request.body;

    const status = 1;

    const product = new Product({
      barcode,
      name,
      category,
      brand,
      model,
      color,
      ram,
      weight,
      amount,
      year,
      original,
      sale,
      status,
    });

    product
      .save()
      .then(() => {
        return response.json({
          code: 0,
          message: "Product created.",
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

Router.post("/update", addProductValidator, async (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const {
      barcode,
      name,
      category,
      brand,
      model,
      color,
      ram,
      weight,
      amount,
      year,
      original,
      sale,
    } = request.body;

    const product = await Product.findOne({ barcode: barcode });

    if (!product) {
      return response.status(401).json({
        code: 2,
        message: "Product not found.",
      });
    } else {
      const isUpdated = await Product.updateOne(
        { barcode: barcode },
        {
          $set: {
            name: name,
            category: category,
            brand: brand,
            model: model,
            color: color,
            ram: ram,
            weight: weight,
            amount: amount,
            year: year,
            original: original,
            sale: sale,
          },
        }
      );

      return response.status(200).json({
        code: 0,
        message: "Product updated.",
      });
    }
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
