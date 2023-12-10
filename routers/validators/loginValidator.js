const { check } = require("express-validator");

module.exports = [
  check("email")
    .exists()
    .withMessage("Please fill out email address.")
    .notEmpty()
    .withMessage("Email address can not be empty.")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password")
    .exists()
    .withMessage("Please fill out password.")
    .notEmpty()
    .withMessage("Password can not be empty.")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),
];
