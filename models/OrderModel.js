const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderDetails = require("./OrderDetailsModel");

const OrderModel = new Schema(
  {
    customerID: {
      type: String,
      ref: "Customer",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paid: {
      type: Number,
      required: true,
    },
    exchange: {
      type: Number,
      required: true,
    },
    orderDetails: { type: [OrderDetails.schema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderModel);
