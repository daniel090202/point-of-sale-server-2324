const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AccountModel = new Schema({
  fullName: {
    type: String,
  },
  age: {
    type: Number,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
  },
  phone: {
    type: String,
  },
  status: {
    type: Number,
  },
});

module.exports = mongoose.model("Account", AccountModel);
