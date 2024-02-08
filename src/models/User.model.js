import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  facebookUrl: {
    type: String,
  },
  offerUpUrl: {
    type: String,
  },
  craiglistUrl: {
    type: String,
  },
  subscribed: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
