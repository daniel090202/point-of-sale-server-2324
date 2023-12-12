const { check } = require("express-validator");

module.exports = [
  check("password")
    .exists()
    .withMessage("Please fill out password.")
    .notEmpty()
    .withMessage("Password can not be empty.")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),
];
