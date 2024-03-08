import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
} from "../controllers/authController.js";
import { Router } from "express";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-Password", forgotPassword);
router.patch("/reset-Password/:token", resetPassword);
router.get('/protected', verifyToken,  (req, res) => {
  // You can use req.user to access the user information
  res.json({ message: 'Access granted', user: req.user });
});



export default router;
