const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const Router = express.Router();

const { validationResult } = require("express-validator");
const loginValidator = require("./validators/loginValidator");
const registerValidator = require("./validators/registerValidator");

const Account = require("../models/AccountModel");

Router.get("/", (request, response) => {
  response.json({
    code: 0,
    message: "Account Router",
  });
});

Router.post("/login", loginValidator, async (request, response) => {
  let result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, password } = request.body;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.status(401).json({
        code: 2,
        message: "Account not found.",
      });
    }

    const passwordMatched = bcrypt.compare(password, account.password);

    if (!passwordMatched) {
      return response.status(401).json({
        code: 3,
        message: "Log in failed. Password incorrect.",
      });
    }

    const { JWT_SECRET } = process.env;

    jwt.sign(
      {
        email: account.email,
        fullName: account.fullName,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
      (error, token) => {
        if (error) {
          throw new Error(error);
        }

        return response.status(200).json({
          code: 0,
          message: "Successfully log in.",
          token: token,
          account: account,
        });
      }
    );
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

Router.post("/register", registerValidator, (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, password, fullName, age, phone, gender, address, status } =
      request.body;

    Account.findOne({
      email: email,
    })
      .then((account) => {
        if (account) {
          throw new Error("Account already exists.");
        }
      })
      .then(() => bcrypt.hash(password, 10))
      .then((hashed) => {
        const user = new Account({
          email: email,
          password: hashed,
          fullName: fullName,
          age: age,
          phone: phone,
          gender: gender,
          address: address,
          status: status,
        });

        return user.save();
      })
      .then(() => {
        return response.json({
          code: 0,
          message: "Successfully register account.",
        });
      })
      .catch((error) => {
        return response.json({
          code: 2,
          message: "Failed to register account: " + error.message,
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

Router.post("/change-password", (request, response) => {});

Router.post("/update-profile", (request, response) => {});

Router.get("/signout", (request, response) => {});

module.exports = Router;
