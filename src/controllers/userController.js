// Import required modules and packages
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import User from '../models/User.js'; // Importing the User model
import mongoose from 'mongoose'; // Importing mongoose for MongoDB interactions
import validator from 'validator'; // Importing validator for input validation

// Destructure mongoose methods for ObjectId validation and validator methods for email validation
const { isValidObjectId } = mongoose;
const { isEmail } = validator;

// Define the UserController object
// Creating #userController as an object puts all user tasks together, making them easier to handle and keep track of.

const userController = {
  // Method to get user by ID
  getUserById: async (req, res) => {
    try {
      // Extract userId from request parameters
      const userId = req.params.userId;

      // Validate userId format
      if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid userId format' }); // Return error if invalid format
      }
      
      // Find user by userId in the database, select only name and email fields, and convert to plain JavaScript object
      const user = await User.findById(userId).select('name email').lean();

      // Check if user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' }); // Return error if user not found
      }
      
      // Ensure sensitive data is not exposed
      delete user.password;
      
      // Return user data
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error); // Log error to console
      res.status(500).json({ error: 'Internal server error' }); // Return internal server error
    }
  },

  // Method to update user information
  updateUser: async (req, res) => {
    // Start a database session and transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Extract userId from request parameters
      const userId = req.params.userId;

      // Validate userId format
      if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid userId format' }); // Return error if invalid format
      }
      
      // Extract updated user data from request body
      const updatedUserData = req.body;
      
      // Validate email format if included in updated data
      if ('email' in updatedUserData) {
        if (!isEmail(updatedUserData.email)) {
          return res.status(400).json({ error: 'Invalid email format' }); // Return error if invalid email format
        }
  
        // Check if email already exists for another user
        const existingUser = await User.findOne({ email: updatedUserData.email }).session(session);
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ error: 'Email already exists' }); // Return error if email already exists
        }
      }
  
      // Hash password if included in updated data
      if ('password' in updatedUserData) {
        const hashedPassword = await bcrypt.hash(updatedUserData.password, 10);
        updatedUserData.password = hashedPassword;
      }
  
      // Define allowed fields for update
      const allowedFields = ['name', 'email', 'password'];
      const updates = {};
      // Filter allowed fields from updated user data
      for (const field of allowedFields) {
        if (updatedUserData[field]) {
          updates[field] = updatedUserData[field];
        }
      }
  
      // Find user by ID and update with the allowed fields, return updated user data
      const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, session }).select('name email').lean();
      if (!updatedUser) {
        await session.abortTransaction(); // Rollback transaction
        session.endSession(); // End session
        return res.status(404).json({ error: 'User not found' }); // Return error if user not found
      }
  
      await session.commitTransaction(); // Commit transaction
      session.endSession(); // End session
      
      // Ensure sensitive data is not exposed
      delete updatedUser.password;
      
      // Return success message and updated user data
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error); // Log error to console
      await session.abortTransaction(); // Rollback transaction
      session.endSession(); // End session
      res.status(500).json({ error: 'Internal server error' }); // Return internal server error
    }
  },

  // Method to delete user
  deleteUser: async (req, res) => {
    try {
      // Extract userId from request parameters
      const userId = req.params.userId;

      // Validate userId format
      if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid userId format' }); // Return error if invalid format
      }
      
      // Start a database session and transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      
      // Find user by ID and delete
      const deletedUser = await User.findByIdAndDelete(userId).session(session);
      if (!deletedUser) {
        await session.abortTransaction(); // Rollback transaction
        session.endSession(); // End session
        return res.status(404).json({ error: 'User not found' }); // Return error if user not found
      }
      
      await session.commitTransaction(); // Commit transaction
      session.endSession(); // End session
      
      // Return success message
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error); // Log error to console
      res.status(500).json({ error: 'Internal server error' }); // Return internal server error
    }
  }
};

export default userController; // Export userController object
