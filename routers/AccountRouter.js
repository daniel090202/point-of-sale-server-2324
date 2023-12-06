const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Router = express.Router();

const { validationResult } = express("express-validator");
const registerValidator = require("./validators/registerValidator");
const loginValidator = require("./validators/loginValidator");

const Account = require("../models/AccountModel");

Router.get("/", (request, response) => {
  response.json({
    code: 0,
    message: "Account Router",
  });
});

Router.get("/login", loginValidator, (request, response) => {
  let result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, password } = request.body;

    Account.findOne({
      email: email,
    })
      .then((account) => {
        if (!account) {
          throw new Error("Email does not exist.");
        }

        return bcrypt.compare(password, account.password);
      })
      .then((passwordMatched) => {
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
            });
          }
        );
      })
      .catch((error) => {
        return response.status(401).json({
          code: 2,
          message: "Log in failed: " + error.message,
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

Router.get("/register", registerValidator, (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, password, fullName } = request.body;

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

module.exports = Router;
