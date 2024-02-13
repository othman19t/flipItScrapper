import Notification from '../models/Notification.model.js';
// Get all notifications
export const getNotifications = async (req, res) => {
  const userId = req.params.userId;
  console.log('====================================');
  console.log('getNotifications hiting userId', userId);
  console.log('====================================');
  try {
    const findNotifications = await Notification.find({
      userId,
      type: 'newPost',
      status: 'unread',
    });
    console.log('====================================');
    console.log('findNotifications', findNotifications.length);
    console.log('====================================');

    const updateNotifications = await Notification.updateMany(
      { userId, type: 'newPost', status: 'unread' }, //unread
      { $set: { status: 'read' } }, //read
      { new: true }
    );

    // console.log('updateNotifications', updateNotifications);

    return res.status(200).json({
      success: true,
      message: 'got notifications data successfully',
      notifications: findNotifications,
    });
  } catch (error) {
    console.log('error', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getNotifications,
};
