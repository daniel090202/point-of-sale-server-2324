const { check } = require("express-validator");

module.exports = [
  check("name")
    .exists()
    .withMessage("Please fill out product name.")
    .notEmpty()
    .withMessage("Product name can not be empty."),

  check("price")
    .exists()
    .withMessage("Please fill out product price.")
    .notEmpty()
    .withMessage("Product price can not be empty.")
    .isNumeric()
    .withMessage("Product price must be numeric."),

  check("description")
    .exists()
    .withMessage("Please fill out product description.")
    .notEmpty()
    .withMessage("Product description can not be empty."),
];
