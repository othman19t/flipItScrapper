import scrapFacebook from '../utillites/scrapFacebook.js';
import getIps from '../utillites/fetchProxys.js';
import chalk from 'chalk'; //dont delete this will need it later
const scrap = async (req, res) => {
  // console.log('body:', req.body);
  const user = req?.body; //array of users data to use for scrapping
  const ips = await getIps(); // retrieves IP addresses to use for scraping purposes

  let i = 0; // used to loop through and keep track of length of posts needs single page scraping
  let failed = true; // keep track if scraping attempt failed

  try {
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
            userId: user.userId,
          };
          initialPosts.push(newObj);
        });
      }
    }
    res.status(200).json({
      success: true,
      message: 'this is the response with all data scrapped',
      initialPosts,
      userId: user.userId,
    });
  } catch (error) {
    console.error('Error in scrap:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default scrap;
