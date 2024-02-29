import mongoose from 'mongoose';
import validator from 'validator';

const { isEmail } = validator;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: [7, 'Minimum length of password is 7 characters']
  }
});

const User = mongoose.model('User', userSchema);

export default User;
