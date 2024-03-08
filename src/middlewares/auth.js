import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import asyncHandlers from "../middlewares/async.js";

dotenv.config();


const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(404).json({ err: "Invalid Bearer" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.TOKEN);

    req.user = {
      userId: payload.userId,
    };
    next();
  } catch (error) {
    res.status(404).json({ err: "Invalid token" });
  }
};

export default auth

// export const protect = asyncHandlers(async (req, res, next) => {
//   let token;
  
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
  
//   if (!token) {
//     return res.status(401).json({ err: "Not authorized to access this route" });
//   }
  
//   try {
//     console.log('Token before verification:', token);

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded Token:', decoded);

//     req.user = await User.findById(decoded.id);
//     next();
//   } catch (err) {
//     console.error('Error during token verification:', err);
//     res.status(401).json({ err: "Invalid token" });
//   }
// });

// export default protect;
