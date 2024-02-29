import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

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
    await mongoose.connect(process.env.MONGO_URL, { dbName: "fuelX" });

    app.listen(PORT, (req, res) => {
      console.log(`listening on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

server();
