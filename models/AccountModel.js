const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AccountModel = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 2,
      required: true,
    },
    avatar: {
      type: String,
    },
    admin: {
      type: Boolean,
      default: false,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", AccountModel);
