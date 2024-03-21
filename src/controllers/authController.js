import Auth from "../models/auth.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from 'bcrypt'
import asyncHandlers from "../middlewares/async.js";
dotenv.config();

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const emailUsed = await Auth.findOne({ email });

    if(!name){
      return res.json({ error: "username must not be empty!"})
    }
    if(!email){
      return res.json({ error: "Email must not be empty!"})
    }
    if(!password || password.length < 6){
      return res.json({ error: "password must be at least 6 characters long!"})
    }

    if (emailUsed) {
      return res.status(409).json({ err: "Email already in used" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const auth = await Auth.create({
      email,
      password: hashed,
      name,
    });

    res.status(201).json({
      msg: "Successfully registered",
      user: { email: auth.email, name: auth.name },
    });
  } catch (error) {
    res
    .status(404).json({ err: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validations for all fields
    if (!email) {
      return res.status(400).json({ error: "Email must not be empty!" });
    } 
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long!" });
    }

    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({ error: 'Invalid password!' });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ error: "JWT secret not properly configured." });
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

    const responseData = {
      message: 'User logged in successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
export const forgotPassword = asyncHandlers(async (req, res) => {
  const { email } = req.body;

    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send password reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "benjaminchidera72@gmail.com",
        pass: "qgaz lfkg btbi oqjf",
      },
    });

    const mailOptions = {
      from: "benjaminchidera72@gmail.com",
      to: email,
      subject: "Reset Your Password",
      text: `http://localhost:5173/resetPassword/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res.json({ status: "Success" });
      }
    });
});



export const resetPassword = async (req, res) => {
  const { token } = req.params;

  const {password} = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Find the user in the database
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ msg: "success" });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
  
};
export const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

