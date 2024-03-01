import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { Router } from "express";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-Password", forgotPassword);
router.patch("/reset-Password/:token", resetPassword);



export default router;
