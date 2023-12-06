const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductModel = new Schema({
  name: {
    type: String,
  },
  price: Number,
  description: String,
});

module.exports = mongoose.model("Product", ProductModel);
