import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import session from "express-session";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    msg: "home page",
    googleLink: "/api/v1/auth/google",
  });
});

// Initialize session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 },
}));


app.use(passport.initialize());
app.use(passport.session());


app.use("/api/v1/", authRouter);
app.use("/api/v1/user", userRouter);

app.use((req, res) => {
  res.status(404).json({ err: "Route not found" });
});



const server = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "fuel" });

    app.listen(PORT, (req, res) => {
      console.log(`listening on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

server();
