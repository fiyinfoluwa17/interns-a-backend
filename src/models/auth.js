import mongoose, { Schema } from "mongoose";
import validator from "validator";
const { isEmail } = validator;

const authSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    validate: [isEmail, "Please enter a valid email address"],
  },

  password: {
    type: String,
    required: true,
    unique: true,
    minlength: [7, "Minimum length of password is 7 characters"],
  },
});

export default mongoose.model("auth", authSchema);
