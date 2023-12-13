const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerModel = new Schema({
  fullName: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("Customer", CustomerModel);
