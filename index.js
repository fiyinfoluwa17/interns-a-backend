import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./src/routes/authRoutes.js";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    msg: "home page",
  });
});




app.use("/api/v1/", authRouter);

app.use((req, res) => {
  res.status(404).json({ err: "Route not found" });
});

const server = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { dbName: "fuelX" });

    app.listen(PORT, (req, res) => {
      console.log(`listening on ${PORT}`);
      console.log('DB connected successfully');
    });
  } catch (error) {
    console.log(error);
  }
};

server();
