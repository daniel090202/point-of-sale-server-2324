const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderDetailsModel = new Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  sale: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("OrderDetails", OrderDetailsModel);
