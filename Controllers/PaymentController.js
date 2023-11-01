// controllers/PaymentController.js
const Payment = require("../Models/PaymentModel");
const User = require("../Controllers/UserController");

const handlePaymentSuccess = async (req, res) => {
  try {
    const { orderId, amount, paymentId, signature } = req.body;

    // Save payment details to the database
    const payment = new Payment({
      orderId,
      amount,
      paymentId,
      signature,
      timestamp: new Date(),
    });
    await payment.save();

    // Send a confirmation email
    // You will need to set up a mailer service and configure it
    // This is just a basic example using Nodemailer
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Configure with your email service
      auth: {
        user: "arunramasamy46@gmail.com",
        pass: "pruxtxnekznczdpc",
      },
    });
    const mailOptions = {
      from: "arunramasamy46@gmail.com",
      to: "arunramasamy1711@gmail.com",
      subject: "Payment Confirmation",
      text: `Payment for order ${orderId} of ${amount} INR was successful.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error: " + error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Return a success response
    return res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    return res.status(500).json({ error: "Payment processing failed" });
  }
};

module.exports = { handlePaymentSuccess };
