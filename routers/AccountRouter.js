const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const Router = express.Router();

const { validationResult } = require("express-validator");

const loginValidator = require("./validators/loginValidator");
const registerValidator = require("./validators/registerValidator");
const changePasswordValidator = require("./validators/changePasswordValidator");

const generateTokens = require("../utils/generateTokens");
const mailer = require("../utils/generateMailTransporter");
const userAuth = require("../middlewares/userAuth.middleware");

const Account = require("../models/AccountModel");

const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (request, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// GET ALL USERS
Router.get("/all-users", userAuth.verifyToken, async (request, response) => {
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
      active: 1,
    }
  );

  return response.json({
    code: 0,
    message: "All users.",
    data: accounts,
  });
});

Router.get(
  "/resend/:userEmail",
  userAuth.verifyTokenAndAdminAuth,
  async (request, response) => {
    const { email } = request.query;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.json({
        code: 1,
        message: "User does not exist.",
      });
    }

    const port = process.env.CLIENT_PORT || 3000;
    const url = `http://localhost:${port}`;

    const activeToken = generateTokens.generateActiveToken(account);

    const emailConfirmationTemplate = `<a href="${url}/signIn?token=${activeToken}">Verify</a>`;

    mailer.sendMail(account.email, "Verify Email", emailConfirmationTemplate);

    return response.status(200).json({
      code: 0,
      message: "Successfully resend.",
    });
  }
);

// GET USER THROUGH EMAIL
Router.get(
  "/:userEmail",
  userAuth.verifyTokenAndAdminAuth,
  async (request, response) => {
    const { email } = request.query;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.json({
        code: 1,
        message: "User does not exist.",
      });
    }

    return response.json({
      code: 1,
      message: "User found.",
      data: {
        account: account,
      },
    });
  }
);

Router.get(
  "/archive/:userEmail",
  userAuth.verifyTokenAndAdminAuth,
  async (request, response) => {
    const { email } = request.query;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.json({
        code: 1,
        message: "User does not exist.",
      });
    }

    await Account.updateOne(
      { email: email },
      {
        $set: {
          status: 2,
        },
      }
    );

    return response.json({
      code: 1,
      message: "User has been archived.",
    });
  }
);

Router.get(
  "/activate/:userEmail",
  userAuth.verifyTokenAndAdminAuth,
  async (request, response) => {
    const { email } = request.query;

    const account = await Account.findOne({ email: email });

    if (!account) {
      return response.json({
        code: 1,
        message: "User does not exist.",
      });
    }

    await Account.updateOne(
      { email: email },
      {
        $set: {
          status: 1,
        },
      }
    );

    return response.json({
      code: 1,
      message: "User has been activated.",
    });
  }
);

Router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const user = await Account.findOneAndDelete(id);

    return response.status(200).json({
      code: 0,
      message: "Delete successfully.",
    });
  } catch (error) {
    return response.status(500).json({
      code: 0,
      message: error.message,
    });
  }
});

Router.post("/login", loginValidator, async (request, response) => {
  let result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const token = request.headers.token;
    const { email, password } = request.body;

    if (token) {
      const activeToken = token.split(" ")[1];
      const { JWT_ACTIVE_KEY } = process.env;

      jwt.verify(activeToken, JWT_ACTIVE_KEY, async (error, payload) => {
        if (error) {
          return response.status(403).json({
            code: 1,
            message: error.message,
          });
        }

        const account = await Account.findOne({ email: payload.email });

        const accessToken = generateTokens.generateAccessToken(account);
        const refreshToken = generateTokens.generateRefreshToken(account);

        response.cookie("refreshToken", refreshToken);

        return response.status(200).json({
          code: 0,
          account: account,
          accessToken: accessToken,
          message: "Successfully login.",
        });
      });
    } else {
      const account = await Account.findOne({ email: email });

      if (!account) {
        return response.status(404).json({
          code: 1,
          message: "User does not exist.",
        });
      }

      const isValid = await bcrypt.compare(password, account.password);

      if (!isValid) {
        return response.status(500).json({
          code: 2,
          message: "Failed to login",
        });
      }
      // SIGN TOKENS FOR EACH USER WHEN SIGN IN
      const accessToken = generateTokens.generateAccessToken(account);
      const refreshToken = generateTokens.generateRefreshToken(account);

      response.cookie("refreshToken", refreshToken);

      return response.status(200).json({
        code: 0,
        account: account,
        accessToken: accessToken,
        message: "Successfully login.",
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

Router.post("/register", registerValidator, async (request, response) => {
  const result = validationResult(request);
  const messages = result.mapped();

  let notification = "";

  if (result.errors.length === 0) {
    const { email, fullName, age, phone, gender, address } = request.body;

    const username = email.split("@")[0];
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(username, salt);

    const account = await Account.findOne({ email: email });

    if (account) {
      return response.status(401).json({
        code: 2,
        message: "User already exists.",
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
      });

      user.save();

      const port = process.env.CLIENT_PORT || 3000;
      const url = `http://localhost:${port}`;

      const activeToken = generateTokens.generateActiveToken(user);

      const emailConfirmationTemplate = `<a href="${url}/signIn?token=${activeToken}">Verify</a>`;

      mailer.sendMail(user.email, "Verify Email", emailConfirmationTemplate);

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

    return response.status(500).json({
      code: 1,
      message: notification,
    });
  }
});

Router.post("/refresh", async (request, response) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return response.status(401).json({
      code: 1,
      message: "Users are not authenticated.",
    });
  }

  const { JWT_REFRESH_KEY } = process.env;

  jwt.verify(refreshToken, JWT_REFRESH_KEY, (error, account) => {
    if (error) {
      return response.status(401).json({
        code: 1,
        message: "Refresh token is not valid.",
      });
    } else {
      const newAccessToken = generateTokens.generateAccessToken(account);
      const newRefreshToken = generateTokens.generateRefreshToken(account);

      response.cookie("refreshToken", newRefreshToken);

      return response.status(200).json({
        code: 0,
        account: account,
        accessToken: newAccessToken,
        message: "Successfully refresh.",
      });
    }
  });
});

Router.post(
  "/update",
  upload.single("file"),
  registerValidator,
  async (request, response) => {
    const result = validationResult(request);
    const messages = result.mapped();

    let notification = "";

    if (result.errors.length === 0) {
      const { email, fullName, age, phone, gender, address } = request.body;

      const fileName = request.file.filename;

      const account = await Account.findOne({ email: email });

      if (!account) {
        return response.status(401).json({
          code: 2,
          message: "Account not found.",
        });
      } else {
        await Account.updateOne(
          { email: email },
          {
            $set: {
              fullName: fullName,
              age: age,
              phone: phone,
              gender: gender,
              address: address,
              avatar: fileName,
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
  }
);

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
        await Account.updateOne(
          { email: email },
          {
            $set: {
              password: hashedPassword,
              active: true,
            },
          }
        );

        const accessToken = generateTokens.generateAccessToken(account);
        const refreshToken = generateTokens.generateRefreshToken(account);

        response.cookie("refreshToken", refreshToken);

        return response.status(200).json({
          code: 0,
          account: account,
          accessToken: accessToken,
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

Router.post("/logout", userAuth.verifyToken, (request, response) => {
  response.clearCookie("refreshToken");

  return response.status(200).json({
    code: 0,
    message: "Successfully logout.",
  });
});

module.exports = Router;
