const { check } = require("express-validator");

module.exports = [
  check("phone")
    .exists()
    .withMessage("Please fill out customer phone.")
    .notEmpty()
    .withMessage("Customer phone can not be empty.")
    .isNumeric()
    .withMessage("Customer phone must be numeric."),
  check("fullName")
    .exists()
    .withMessage("Please fill out full name.")
    .notEmpty()
    .withMessage("Full name can not be empty.")
    .isLength({ min: 5 })
    .withMessage("Full name must be at least 5 characters long."),
  check("address")
    .exists()
    .withMessage("Please fill out customer address.")
    .notEmpty()
    .withMessage("Customer address can not be empty."),
];
