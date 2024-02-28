import scrapSinglePage from '../utillites/scrapSinglePage.js';
import searchTimeWords from '../utillites/searchTimeWords.js';
import getIps from '../utillites/fetchProxys.js';
import chalk from 'chalk';
import proxyChain from 'proxy-chain';

const scrap = async (req, res) => {
  const proxyServer = `${process.env.BACK_UP_PROXY}`;
  const proxyUrl = `http://${proxyServer}`;
  const backupIp = await proxyChain.anonymizeProxy({
    url: proxyUrl,
  });
  // console.log('body:', req.body);
  const post = req?.body; //array of users data to use for scrapping
  const mainIps = await getIps(); // retrieves IP addresses to use for scraping purposes

  let usedPackupProxy = false; // to keep track of whether used packup proxy or not
  let blockedIps = [];
  let failed = true; // keep track if scraping attempt failed

  try {
    console.log('====================================');
    console.log('mainIps', mainIps);
    console.log('====================================');
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
      console.log('scraping with ip: ', ip);
      const scrapPost = await scrapSinglePage(post.postUrl, ip); // single page scrap function passing page url and ip to initate scrapping attempt

      if (scrapPost?.failed) {
        blockedIps.push(ip);
        mainIps.shift();
      } else {
        failed = false;
        const oldPost = searchTimeWords(scrapPost.postedDate);
        if (!oldPost) {
          console.log(
            chalk.bgBlue('oldPost', oldPost, ' => ', scrapPost.postedDate)
          );
          if (usedPackupProxy) {
            console.log(chalk.blue('closing backup proxy connection'));
            const { hostname, port } = new URL(backupIp);
            await proxyChain.closeTunnel(`${hostname}:${port}`);
          }
          res.status(200).json({
            success: true,
            newPost: true,
            message:
              'this is the response with facebookSinglePage data scrapped',
            date: { postedDate: scrapPost.postedDate },
          });
        } else {
          if (usedPackupProxy) {
            console.log(chalk.blue('closing backup proxy connection'));
            const { hostname, port } = new URL(backupIp);
            await proxyChain.closeTunnel(`${hostname}:${port}`);
          }
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
