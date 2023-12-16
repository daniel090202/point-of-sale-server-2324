const jwt = require("jsonwebtoken");

const { JWT_ACTIVE_KEY, JWT_ACCESS_KEY, JWT_REFRESH_KEY } = process.env;

const generateTokens = {
  generateActiveToken: (user) => {
    return jwt.sign(
      {
        email: user.email,
      },
      JWT_ACTIVE_KEY,
      {
        expiresIn: "60s",
      }
    );
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        email: user.email,
        admin: user.admin,
      },
      JWT_ACCESS_KEY,
      {
        expiresIn: "24h",
      }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        email: user.email,
        admin: user.admin,
      },
      JWT_REFRESH_KEY,
      {
        expiresIn: "365d",
      }
    );
  },
};

module.exports = generateTokens;
