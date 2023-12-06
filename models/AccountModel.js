const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountModel = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  fullName: String,
});

module.exports = mongoose.model("Account", AccountModel);
