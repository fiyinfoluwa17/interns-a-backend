import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { Router } from "express";
import passport from "../controllers/authController.js";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-Password", forgotPassword);
router.patch("/reset-Password/:token", resetPassword);

// google



router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});


// getting google profile
router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      `<h1>You are logged in</h1> <span>${JSON.stringify(
        req.user,
        null,
        2
      )} </span>`
    );
  } else {
    res.redirect("/");
  }
});

export default router;
