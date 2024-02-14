import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import scrapFacebook from '../utillites/scrapFacebook.js';
import Notification from '../models/Notification.model.js';
import scrapSinglePage from '../utillites/scrapSinglePage.js';
import searchTimeWords from '../utillites/searchTimeWords.js';

const scrap = async (req, res) => {
  try {
    const users = await User.find({ subscribed: true }).select('facebookUrl');
    if (users.length > 0) {
      // Collect all user processing promises
      const userPromises = users.map(async (user) => {
        let postsdata = [];
        // ...rest of your user processing logic
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
        // Inserting nonexisting posts and collecting notification promises
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
        console.log('nonexistingPosts', nonexistingPosts.length);
        const notifications = [];
        if (nonexistingPosts.length > 0) {
          try {
            const result = await Post.insertMany(nonexistingPosts, {
              ordered: false,
            });
            // Map through results and create promises for each notification
            const notificationPromises = result.map(async (ele) => {
              const scrapPost = await scrapSinglePage(ele.postUrl);
              const oldPost = searchTimeWords(scrapPost.postedDate);
              if (!oldPost) {
                const notification = {
                  postLocalId: ele._id,
                  userId: ele.userId,
                  type: 'newPost',
                  status: 'unread',
                };
                return notification;
              }
              return null;
            });

            // Wait for all notification promises to resolve and filter out nulls
            const resolvedNotifications = (
              await Promise.all(notificationPromises)
            ).filter((n) => n);
            // Add to the notifications array
            notifications.push(...resolvedNotifications);
          } catch (error) {
            throw new Error(
              'Error inserting nonexisting posts: ' + error.message
            );
          }
        }
        console.log('notifications.length', notifications.length);
        return notifications; // Return the notifications for this user
      });

      // Wait for all user promises to resolve and flatten the result into a single array
      const allNotifications = (await Promise.all(userPromises)).flat();

      // Insert notifications if any have been created
      if (allNotifications.length > 0) {
        console.log('allNotifications.length', allNotifications.length);
        const insertNotifications = await Notification.insertMany(
          allNotifications
        );
        console.log('insertNotifications length', insertNotifications.length);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Scrap endpoint hit and everything went well',
    });
  } catch (error) {
    console.error('Error in scrap:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default scrap;
