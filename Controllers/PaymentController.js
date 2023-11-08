// controllers/PaymentController.js
const Payment = require("../Models/PaymentModel");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

const handlePaymentSuccess = async (req, res) => {
  try {
    const { orderId, amount, paymentId, signature, recipientEmail } = req.body;

    if (!orderId || !amount || !paymentId || !signature || !recipientEmail) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Save payment details to the database
    const payment = new Payment({
      orderId,
      amount,
      paymentId,
      signature,
      recipientEmail,
      timestamp: new Date(),
    });

    await payment.save();

    // Send a confirmation email to the recipient
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "arunramasamy46@gmail.com",
        pass: "pruxtxnekznczdpc",
      },
    });

    const mailOptions = {
      from: "arunramasamy46@gmail.com",
      to: recipientEmail,
      subject: "Payment Confirmation",
      text: `Payment for order ${orderId} of ${amount} INR was successful.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error: " + error);
        return res.status(500).json({ error: "Email sending failed" });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({ message: "Payment successful" });
      }
    });
  } catch (error) {
    console.error("Payment processing error: " + error);
    return res.status(500).json({ error: "Payment processing failed" });
  }
};

const createOrder = async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail;

    // Save the recipient's email to the database
    const payment = new Payment({
      recipientEmail,
      timestamp: new Date(),
    });

    await payment.save();

    // Use the Razorpay package to create an order
    const razorpay = new Razorpay({
      key_id: "rzp_test_nlbvgLgyo99Uom",
      key_secret: "CdJ75QZkenKvGkdeqNlcECVP",
    });

    // Replace this with the actual order details
    const orderData = {
      amount: 1000, // Amount in paisa (e.g., 1000 for 10 INR)
      currency: "INR",
      receipt: "order123",
    };

    razorpay.orders.create(orderData, async function (err, order) {
      if (err) {
        console.error("Error creating Razorpay order: " + err);
        return res.status(500).json({ error: "Failed to create an order" });
      }

      // Send a confirmation email to the recipient
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "arunramasamy46@gmail.com",
          pass: "pruxtxnekznczdpc",
        },
      });

      const mailOptions = {
        from: "arunramasamy46@gmail.com",
        to: recipientEmail,
        subject: "Order Created",
        text: `Your order with receipt number ${order.receipt} has been successfully created.`,
      };

      transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          console.log("Email error: " + emailError);
          return res.status(500).json({ error: "Email sending failed" });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json(order);
        }
      });
    });
  } catch (error) {
    console.error("Order creation error: " + error);
    return res.status(500).json({ error: "Order creation failed" });
  }
};

module.exports = { handlePaymentSuccess, createOrder };
