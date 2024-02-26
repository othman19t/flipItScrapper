import scrapSinglePage from '../utillites/scrapSinglePage.js';
import searchTimeWords from '../utillites/searchTimeWords.js';
import getIps from '../utillites/fetchProxys.js';
import chalk from 'chalk';
const scrap = async (req, res) => {
  // console.log('body:', req.body);
  const post = req?.body; //array of users data to use for scrapping
  const ips = await getIps(); // retrieves IP addresses to use for scraping purposes

  let i = 0; // used to loop through and keep track of length of posts needs single page scraping
  let failed = true; // keep track if scraping attempt failed

  try {
    // keep trying to scrap until it is successful then assign failed to false then exit while loop | when it fails because of IP then increase vaule of i++ to grap the next ip address in the next round | when i is = to length of ips rest it to 0 to try again | in the end assign data to initial posts when all sccessed
    while (failed) {
      const ip = `${ips.results[i].proxy_address}:${ips.results[i].port}`; // ip address to use for this single attempt
      console.log('scraping with ip: ', ip);
      const scrapPost = await scrapSinglePage(post.postUrl, ip); // single page scrap function passing page url and ip to initate scrapping attempt

      if (scrapPost?.failed) {
        if (i >= ips.count - 1) {
          i = 0;
        }
        i++;
      } else {
        failed = false;
        const oldPost = searchTimeWords(scrapPost.postedDate);
        if (!oldPost) {
          console.log(
            chalk.bgGreenBright(
              ('oldPost', oldPost, ' => ', scrapPost.postedDate)
            )
          );
          res.status(200).json({
            success: true,
            newPost: true,
            message:
              'this is the response with facebookSinglePage data scrapped',
            date: { postedDate: scrapPost.postedDate },
          });
        } else {
          res.status(200).json({
            success: true,
            newPost: false,
            message: 'this is the response with all data scrapped',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in facebookSinglePageScrap:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default scrap;
