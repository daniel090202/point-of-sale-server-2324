const jwt = require("jsonwebtoken");

const userAuth = {
  // VERIFY THE USER TOKEN
  verifyToken: async (request, response, next) => {
    // GET TOKEN SENT FROM USER
    const token = request.headers.token;

    if (token) {
      const { JWT_ACCESS_KEY } = process.env;
      const accessToken = token.split(" ")[1];

      jwt.verify(accessToken, JWT_ACCESS_KEY, (error, account) => {
        if (error) {
          return response.status(403).json({
            code: 1,
            message: "Invalid token.",
          });
        }

        request.account = account;
        next();
      });
    } else {
      // USER NOT LOG IN OR REGISTER
      return response.status(401).json({
        code: 1,
        message: "User are not authenticated.",
      });
    }
  },

  // VERIFY ADMIN TOKEN
  verifyTokenAndAdminAuth: async (request, response, next) => {
    userAuth.verifyToken(request, response, () => {
      if (
        request.account.email === request.params.email ||
        request.account.admin
      ) {
        next();
      } else {
        return response.status(403).json({
          code: 2,
          message: "Users are not allowed.",
        });
      }
    });
  },
};

module.exports = userAuth;
