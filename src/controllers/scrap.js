import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import scrapFacebook from '../utillites/scrapFacebook.js';
import Notification from '../models/Notification.model.js';
import scrapSinglePage from '../utillites/scrapSinglePage.js';
import searchTimeWords from '../utillites/searchTimeWords.js';
import getIps from '../utillites/fetchProxys.js';
import calculateDistance from '../utillites/calculateDistance.js';
import chalk from 'chalk';
const scrap = async (req, res) => {
  const ips = await getIps(); // retrieves IP addresses to use for scraping purposes
  let i = 0; // used to loop through and keep track of length of posts needs single page scraping
  let failed = true; // keep track if scraping attempt failed
  try {
    const users = await User.find({ subscribed: true }).select(
      'facebookUrl postalCode radius'
    ); // gets subscribed users to scrap dat'a for them
    console.log('users', users);
    if (users.length > 0) {
      // Collect all users processing promises
      const userPromises = users.map(async (user) => {
        let initialPosts = [];
        // keep trying to scrap until it is successful then assign failed to false then exit while loop | when it fails because of IP then increase vaule of i++ to grap the next ip address in the next round | when i is = to length of ips rest it to 0 to try again | in the end assign data to initial posts when all sccessed
        while (failed) {
          const ip = `${ips.results[i].proxy_address}:${ips.results[i].port}`; // ip address to use for this single attempt
          console.log('scraping with ip: ', ip);
          const mainFacebookScrap = await scrapFacebook(user.facebookUrl, ip); // main scrap function passing page url and ip to initate scrapping attempt
          console.log('mainFacebookScrap.length = ', mainFacebookScrap?.length);
          if (mainFacebookScrap?.failed) {
            if (i >= ips.count - 1) {
              i = 0;
            }
            i++;
          } else {
            failed = false;
            mainFacebookScrap.map((ele) => {
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
              initialPosts.push(newObj);
            });
          }
        }

        // get existing posts to use it to get the noneisting posts
        const existingIds = (
          await Post.find({
            postId: { $in: initialPosts.map((doc) => doc.postId) },
          })
        ).map((doc) => doc.postId);

        // use the existing posts to get the non existing posts
        const nonexistingPosts = initialPosts.filter(
          (doc) => !existingIds.includes(doc.postId)
        );
        console.log('nonexistingPosts.lenght', nonexistingPosts.length);

        // check if non existing posts > 0 insert them and create notification and insert thme
        const notifications = [];
        if (nonexistingPosts.length > 0) {
          try {
            const result = await Post.insertMany(nonexistingPosts, {
              ordered: false,
            });

            // Map through results(inserted posts) and scrap url of each of these posts to get the time were posted
            const notificationPromises = result.map(async (ele) => {
              // const withInUserDistance = distance >= user.radius; // true if distance is within radius
              if (
                calculateDistance(ele?.location, user.postalCode, user.radius)
              ) {
                const ip = `${ips.results[i].proxy_address}:${ips.results[i].port}`;
                if (i >= ips.count - 1) {
                  i = 0;
                } else {
                  i++;
                }
                const scrapPost = await scrapSinglePage(ele.postUrl, ip);
                const oldPost = searchTimeWords(scrapPost.postedDate);
                if (!oldPost) {
                  console.log(
                    chalk.bgGreen(
                      'oldPost',
                      oldPost,
                      ' => ',
                      scrapPost.postedDate
                    )
                  );
                  const notification = {
                    postLocalId: ele._id,
                    userId: ele.userId,
                    type: 'newPost',
                    status: 'unread',
                  };
                  return notification;
                }
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
