const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: String,
  razorpayKey: String,
  amount: Number,
  paymentId: String,
  signature: String,
  recipientEmail: String, // Store the recipient's email
  timestamp: Date,
});

module.exports = mongoose.model("Payment", paymentSchema);
