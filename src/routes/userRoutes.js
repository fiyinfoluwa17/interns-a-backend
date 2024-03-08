import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';  
import limiter from '../middlewares/limiter.js'; // Import the rate limiting middleware

const router = express.Router();

// Define endpoint routes for userController
router.get('/user/:userId', auth, limiter, userController.getUserById); // Apply limiter middleware here
router.patch('user/:userId', auth, limiter, userController.updateUser); // Apply limiter middleware here
router.delete('user/:userId', auth, limiter, userController.deleteUser); // Apply limiter middleware here

export default router;