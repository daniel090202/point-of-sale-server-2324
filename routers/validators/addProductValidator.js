const { check } = require("express-validator");

module.exports = [
  check("barcode")
    .exists()
    .withMessage("Please fill out barcode.")
    .notEmpty()
    .withMessage("Barcode can not be empty."),
  check("name")
    .exists()
    .withMessage("Please fill out product name.")
    .notEmpty()
    .withMessage("Product name can not be empty."),
  check("category")
    .exists()
    .withMessage("Please fill out product category.")
    .notEmpty()
    .withMessage("Product category can not be empty."),
  check("brand")
    .exists()
    .withMessage("Please fill out product brand.")
    .notEmpty()
    .withMessage("Product brand can not be empty."),
  check("model")
    .exists()
    .withMessage("Please fill out product model.")
    .notEmpty()
    .withMessage("Product model can not be empty."),
  check("color")
    .exists()
    .withMessage("Please fill out product color.")
    .notEmpty()
    .withMessage("Product color can not be empty."),
  check("ram")
    .exists()
    .withMessage("Please fill out product ram.")
    .notEmpty()
    .withMessage("Product ram can not be empty.")
    .isNumeric()
    .withMessage("Product ram must be numeric."),
  check("amount")
    .exists()
    .withMessage("Please fill out product amount.")
    .notEmpty()
    .withMessage("Product amount can not be empty.")
    .isNumeric()
    .withMessage("Product amount must be numeric."),
  check("year")
    .exists()
    .withMessage("Please fill out release year.")
    .notEmpty()
    .withMessage("Release year can not be empty.")
    .isNumeric()
    .withMessage("Release year ram must be numeric."),
  check("original")
    .exists()
    .withMessage("Please fill out product original price.")
    .notEmpty()
    .withMessage("Product original price can not be empty.")
    .isNumeric()
    .withMessage("Product original price must be numeric."),
  check("sale")
    .exists()
    .withMessage("Please fill out product sale price.")
    .notEmpty()
    .withMessage("Product sale price can not be empty.")
    .isNumeric()
    .withMessage("Product sale price must be numeric."),
];
