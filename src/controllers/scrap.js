import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import scrapFacebook from '../utillites/scrapFacebook.js';
import Notification from '../models/notification.model.js';

export const scrap = async (req, res) => {
  try {
    const users = await User.find({ subscribed: true }).select('facebookUrl'); // getting all subscribed users

    // if users are more then  0 then loop through and start the process
    if (users.length > 0) {
      users.map(async (user) => {
        let postsdata = [];
        const data = await scrapFacebook(user.facebookUrl); // pass the url to scrap data
        data.map((ele) => {
          const newObj = {
            title: ele.title,
            price: ele.price,
            imgSrc: [ele.imgSrc],
            location: ele.location,
            postUrl: ele.postUrl,
            postId: ele.postUrl.match(/\/item\/(.*?)\//)[1],
            platform: 'facebook',
            userId: user._id,
          };
          postsdata.push(newObj);
        });

        // get existing posts to use it to get the noneisting posts
        const existingIds = (
          await Post.find({
            postId: { $in: postsdata.map((doc) => doc.postId) },
          })
        ).map((doc) => doc.postId);
        // use the existing posts to get the non existing posts
        const nonexistingPosts = postsdata.filter(
          (doc) => !existingIds.includes(doc.postId)
        );
        console.log('nonexistingPosts length', nonexistingPosts.length);
        //********* inserting nonexisting posts ********** */
        try {
          const notifications = [];
          const result = await Post.insertMany(nonexistingPosts, {
            ordered: false,
          });
          if (result.length > 0) {
            result.map((ele) => {
              const notification = {
                postLocalId: ele._id,
                userId: ele.userId,
                type: 'newPost',
                status: 'unread',
              };
              notifications.push(notification);
            });
            /** insert notifications **/
            if (notifications.length > 0) {
              const insertNotifications = await Notification.insertMany(
                notifications
              );
              console.log(
                'insertNotifications length',
                insertNotifications.length
              );
            }
          }
        } catch (error) {
          console.error('Error:', error);
          res.status(400).json({
            success: false,
            message: 'somthing went wrong check code line around 70',
          });
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: 'endpoint hit and everything went well',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { scrap };
