import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';  
import axios from 'axios';
import limiter from '../middlewares/limiter.js'; // Import the rate limiting middleware

const router = express.Router();

// Define endpoint routes for userController
router.get('/user/:userId', auth, limiter, userController.getUserById); // Apply limiter middleware here
router.patch('user/:userId', auth, limiter, userController.updateUser); // Apply limiter middleware here
router.delete('user/:userId', auth, limiter, userController.deleteUser); // Apply limiter middleware here
router.get('/places', async (req, res) => {
    try {
      const { location, radius, type, apiKey } = req.query;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const response = await axios.get(url, {
        params: {
          location,
          radius,
          type,
          key: apiKey,
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
export default router;