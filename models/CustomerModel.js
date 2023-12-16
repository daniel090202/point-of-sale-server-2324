const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerModel = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
});

module.exports = mongoose.model("Customer", CustomerModel);
