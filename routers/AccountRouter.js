const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const Router = express.Router();

const { validationResult } = require("express-validator");

const loginValidator = require("./validators/loginValidator");
const registerValidator = require("./validators/registerValidator");
const changePasswordValidator = require("./validators/changePasswordValidator");

const Account = require("../models/AccountModel");

Router.get("/", async (request, response) => {
  const accounts = await Account.find(
    {},
    {
      attributeToSelect: 1,
      _id: 0,
      fullName: 1,
      email: 1,
      age: 1,
      phone: 1,
      gender: 1,
      address: 1,
      status: 1,
    }
  );

  return response.json({
    code: 0,
    message: "List of accounts.",
    data: accounts,
  });
});

Router.get("/change-status", async (request, response) => {
  const { email, status } = request.query;

  const account = await Account.findOne({ email: email });

  if (!account) {
    return response.json({
      code: 2,
      message: "Account not found.",
    });
  }

  if (status === account.status) {
    return response.json({
      code: 1,
      message: "Same status.",
    });
  } else {
    await Account.updateOne(
      { email: email },
      {
        $set: {
          status: status,
        },
      }
    );

    const data = await Account.findOne(
      { email: email },
      {
        attributeToSelect: 1,
        _id: 0,
        fullName: 1,
        email: 1,
        age: 1,
        phone: 1,
        gender: 1,
        address: 1,
        status: 1,
      }
    );

    if (status === 1) {
      return response.json({
        code: 0,
        data: data,
        message: "Account archived.",
      });
    } else {
      return response.json({
        code: 0,
        data: data,
        message: "Account activated.",
      });
    }
  }
});

Router.post("/login", loginValidator, async (request, response) => {
  let result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, password } = request.body;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.json({
        code: 2,
        message: "Account not found.",
      });
    }

    const passwordMatched = await bcrypt.compare(password, account.password);

    if (!passwordMatched) {
      return response.json({
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

Router.post("/register", registerValidator, async (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, fullName, age, phone, gender, address } = request.body;

    const username = email.split("@")[0];
    const password = await bcrypt.hash(username, 10);
    const status = "1";

    const account = await Account.findOne({ email: email });

    if (account) {
      return response.status(401).json({
        code: 2,
        message: "Account already exists.",
      });
    } else {
      const user = new Account({
        email: email,
        fullName: fullName,
        age: age,
        phone: phone,
        gender: gender,
        address: address,
        password: password,
        status: status,
      });

      user.save();

      return response.status(200).json({
        code: 0,
        message: "Successfully register.",
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

Router.post("/update", registerValidator, async (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, fullName, age, phone, gender, address } = request.body;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.status(401).json({
        code: 2,
        message: "Account not found.",
      });
    } else {
      const isUpdated = await Account.updateOne(
        { email: email },
        {
          $set: {
            fullName: fullName,
            age: age,
            phone: phone,
            gender: gender,
            address: address,
          },
        }
      );

      return response.status(200).json({
        code: 0,
        message: "Account updated.",
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

Router.post(
  "/change-password",
  changePasswordValidator,
  async (request, response) => {
    const result = validationResult(request);
    const messages = result.mapped();

    let notification = "";

    if (result.errors.length === 0) {
      const { email, password } = request.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const account = await Account.findOne({ email: email });

      if (!account) {
        return response.status(401).json({
          code: 2,
          message: "Account not found.",
        });
      } else {
        const isUpdated = await Account.updateOne(
          { email: email },
          {
            $set: {
              password: hashedPassword,
            },
          }
        );

        return response.status(200).json({
          code: 0,
          message: "Password updated.",
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
  }
);

module.exports = Router;
