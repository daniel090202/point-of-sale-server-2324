const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductModel = new Schema({
  barcode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  ram: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  original: {
    type: Number,
    required: true,
  },
  sale: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Product", ProductModel);
