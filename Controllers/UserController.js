const User = require("../Models/UserForm");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

async function registerUser(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(409).send({ message: "User already exists" });
    }

    if (!password) {
      console.log("Password is required");
      return res.status(400).send({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).send({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log("Unregistered User");
      return res.status(404).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(401).send({ message: "Incorrect password" });
    } else {
      console.log("User Logged Successfully");
      return res.status(200).send({ message: "User Logged Successfully" });
    }
  } catch (error) {
    console.error("Error Occurred" + " " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Not a user");
      return res.status(404).send({ message: "User not found" });
    }

    const token = Math.random().toString(36).slice(-8);

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "arunramasamy46@gmail.com",
        pass: "pruxtxnekznczdpc",
      },
    });

    const mailOptions = {
      from: "arunramasamy46@gmail.com",
      to: user.email,
      subject: "Reset your password",
      html: `<h1>Hello ${user.firstName}</h1>
<a href="http://localhost:3000/resetPassword/${token}">Click here </a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Failed to send reset password email" });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Reset password email sent" });
    });
  } catch (error) {
    console.error("Error Occurred" + " " + error);
    return res.status(501).send({ message: "Internal Server Error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
