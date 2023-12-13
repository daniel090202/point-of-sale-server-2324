const express = require("express");
const Router = express.Router();

const { validationResult } = require("express-validator");
const addCustomerValidator = require("./validators/addCustomerValidator");

const Customer = require("../models/CustomerModel");

Router.get("/", async (request, response) => {
  const customers = await Customer.find(
    {},
    {
      attributeToSelect: 1,
      _id: 0,
      phone: 1,
      fullName: 1,
      address: 1,
    }
  );

  if (customers.length > 0) {
    return response.json({
      code: 0,
      message: "List of customers.",
      data: customers,
    });
  } else {
    return response.json({
      code: 1,
      message: "List of customers is empty.",
    });
  }
});

Router.post("/add", addCustomerValidator, (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { phone, address, fullName } = request.body;

    const customer = new Customer({ phone, address, fullName });

    customer
      .save()
      .then(() => {
        return response.json({
          code: 0,
          message: "Customer created.",
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
