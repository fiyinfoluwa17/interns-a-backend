import Auth from "../models/auth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const emailUsed = await Auth.findOne({ email });

    if (emailUsed) {
      return res.status(404).json({ err: "Email already in used" });
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
    res.status(404).json({ err: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ err: "Invalid Credentials" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(404).json({ err: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN, {
      expiresIn: "2h",
    });

    res.status(200).json({
      msg: "success",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        token,
      },
    });
  } catch (error) {
    res.status(404).json({ err: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN, {
      expiresIn: "2h",
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
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const resetPassword = async (req, res) => {
  const { token } = req.params;

  const {password} = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN);
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
    res.status(500).json({ error: "Internal server error" });
  }
};

// this is for google authentication

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // METHOD USED TO CREATE OR AUTHENTICATE
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;