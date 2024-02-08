import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 'User' should match the name you gave to your user model
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // 'Post' should match the name you gave to your post model
    required: true,
  },
  //   updatedAt: {
  //     type: Date,
  //     default: Date.now,
  //   },
});

// Then create a Model from it
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
