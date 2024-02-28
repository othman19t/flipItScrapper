import scrapFacebook from '../utillites/scrapFacebook.js';
import getIps from '../utillites/fetchProxys.js';
import chalk from 'chalk'; //dont delete this will need it later
import proxyChain from 'proxy-chain';

const scrap = async (req, res) => {
  const proxyServer = `${process.env.BACK_UP_PROXY}`;
  const proxyUrl = `http://${proxyServer}`;
  const backupIp = await proxyChain.anonymizeProxy({
    url: proxyUrl,
  });

  // console.log('body:', req.body);
  const user = req?.body; //array of users data to use for scrapping
  const mainIps = await getIps(); // retrieves IP addresses to use for scraping purposes
  // let i = 0; // used to loop through and keep track of length of posts needs single page scraping
  let failed = true; // keep track if scraping attempt failed
  let usedPackupProxy = false; // to keep track of whether used packup proxy or not
  let blockedIps = [];
  try {
    console.log('====================================');
    console.log('mainIps', mainIps);
    console.log('====================================');
    let initialPosts = [];
    // keep trying to scrap until it is successful then assign failed to false then exit while loop | when it fails because of IP then increase vaule of i++ to grap the next ip address in the next round | when i is = to length of ips rest it to 0 to try again | in the end assign data to initial posts when all sccessed
    while (failed) {
      let ip = mainIps.length > 0 ? mainIps[0] : backupIp;
      if (mainIps.length > 0) {
        console.log('====================================');
        console.log('remaining main ips: ', mainIps.length);
        console.log('====================================');
      } else {
        usedPackupProxy = true;
        console.log(chalk.red('scrapper just used backup Ip'));
      }
      // const ip = `${mainIps.length > 0 ? mainIps[0] : backupIp}`; // ip address to use for this single attempt
      console.log('scraping with ip: ', ip);
      const mainFacebookScrap = await scrapFacebook(user.facebookUrl, ip); // main scrap function passing page url and ip to initate scrapping attempt
      console.log('mainFacebookScrap.length = ', mainFacebookScrap?.length);
      if (mainFacebookScrap?.failed) {
        blockedIps.push(ip);
        mainIps.shift();
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
    if (usedPackupProxy) {
      console.log(chalk.blue('closing backup proxy connection'));
      const { hostname, port } = new URL(backupIp);
      await proxyChain.closeTunnel(`${hostname}:${port}`);
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
