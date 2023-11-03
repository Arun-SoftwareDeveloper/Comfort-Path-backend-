// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: String,
  razorpayKey: String,
  amount: Number,
  paymentId: String,
  signature: String,
  timestamp: Date,
});

module.exports = mongoose.model("Payment", paymentSchema);
