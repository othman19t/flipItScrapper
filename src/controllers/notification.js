import Notification from '../models/notification.model.js';
// Get all notifications
export const getNotifications = async (req, res) => {
  console.log('====================================');
  console.log('hiting');
  console.log('====================================');
  try {
    const notifications = await Notification.find({});
    console.log('Notifications', notifications);
    // userId,
    // // type: 'newPosts',
    // status: 'unread',

    // .find({}) will return all documents in the collection
    return res.status(200).json(notifications);
  } catch (error) {
    // Handle possible errors
    return res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req, res) => {
  console.log('body', req.body);
  try {
    const fakeData = {
      status: 'unread',
      type: 'newPost',
      userId: '65c42628634a0830211559f8',
      postId: '65c42628634a0830211559f8',
    };

    const newNotifications = await new Notification(fakeData);
    newNotifications.save();
    return res
      .status(200)
      .json({ sucess: true, message: 'New notifications created' });
  } catch (error) {
    // Handle possible errors
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 
  const fakeData = {
    status: "unread",
  type:"newPost"
  userId:"1",
  postId: '1',
  updatedAt:Date.now,


  }



*/
export default {
  getNotifications,
  createNotification,
};
