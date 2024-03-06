import scrapSinglePage from '../utillites/scrapSinglePage.js';
import searchTimeWords from '../utillites/searchTimeWords.js';
import getIps from '../utillites/fetchProxys.js';
import chalk from 'chalk';
import proxyChain from 'proxy-chain';
import dotenv from 'dotenv';

dotenv.config();
const scrap = async (req, res) => {
  global.appCache = {};

  const backupIp = {
    ip: process.env.BACK_UP_IP,
    port: process.env.BACK_UP_PORT,
    username: process.env.BACK_UP_USERNAME,
    password: process.env.BACK_UP_PASSWORD,
  };
  // console.log('body:', req.body);
  const post = req?.body; //array of users data to use for scrapping
  const mainProxy = await getIps(); // retrieves IP addresses to use for scraping purposes
  let mainIps = mainProxy;
  let usedPackupProxy = false; // to keep track of whether used packup proxy or not
  let failed = true; // keep track if scraping attempt failed
  let updatedPost = {};
  let ip = undefined;
  // try {
  // keep trying to scrap until it is successful then assign failed to false then exit while loop | when it fails because of IP then increase vaule of i++ to grap the next ip address in the next round | when i is = to length of ips rest it to 0 to try again | in the end assign data to initial posts when all sccessed
  while (failed) {
    if (usedPackupProxy) {
      console.log(chalk.blue('closing backup proxy connection'));
      const { hostname, port } = new URL(backupIp);
      await proxyChain.closeTunnel(`${hostname}:${port}`);
    }
    console.log('global.appCache', global.appCache);
    if (
      Array.isArray(global?.appCache?.blockedIps) &&
      global?.appCache?.blockedIps > 5
    ) {
      const elementsToKeep = global?.appCache?.blockedIps?.slice(-5);
      global.appCache.blockedIps = elementsToKeep;
    }

    mainIps?.forEach((ele) => {
      const blockedIps = global?.appCache?.blockedIps;
      if (!Array.isArray(blockedIps) || !blockedIps?.includes(ele.ip)) {
        ip = ele;
        return;
      }
    });
    if (ip == undefined) {
      ip = backupIp;
      usedPackupProxy = true;
      console.log(chalk.hex('#4d020e')('scrapper just used backup Ip'));
    }

    const scrapPost = await scrapSinglePage(post.postUrl, ip); // single page scrap function passing page url and ip to initate scrapping attempt
    console.log('scrapPost?.description', scrapPost?.description);
    if (scrapPost?.failed) {
      if (
        Array.isArray(global?.appCache?.blockedIps) &&
        ip.ip != process.env.BACK_UP_IP &&
        !global?.appCache?.blockedIps?.includes(ip.ip)
      ) {
        const blockedIps = global?.appCache?.blockedIps;
        const blocked = blockedIps;
        global.appCache.blockedIps = [...blocked, ip.ip];
      } else {
        global.appCache.blockedIps = [ip.ip];
      }

      // add blocked ip for the first time
    } else {
      failed = false;
      const oldPost = searchTimeWords(scrapPost.date);
      if (!oldPost) {
        updatedPost = { description: scrapPost?.description, ...post };
        console.log(chalk.bgBlue(`new Post found ${scrapPost?.date}`));
        if (usedPackupProxy) {
          console.log(chalk.blue('closing backup proxy connection'));
          const { hostname, port } = new URL(backupIp);
          await proxyChain.closeTunnel(`${hostname}:${port}`);
        }
        console.log('updatedPost.description', updatedPost?.description);
        return res.status(200).json({
          success: true,
          accepted: true,
          message: 'this is the response with facebookSinglePage data scrapped',
          post: updatedPost,
        });
      } else {
        if (usedPackupProxy) {
          console.log(chalk.blue('closing backup proxy connection'));
          const { hostname, port } = new URL(backupIp);
          await proxyChain.closeTunnel(`${hostname}:${port}`);
        }
        return res.status(200).json({
          success: true,
          accepted: false,
          postId: post._id,
          message: 'this is the response with all data scrapped',
        });
      }
    }
  }
  return res.status(200).json({
    success: true,
    accepted: false,
    postId: post._id,
    message: 'this is the response with all data scrapped',
  });
  // } catch (error) {
  //   console.error('Error in facebookSinglePageScrap:', error);
  //   res.status(500).json({ success: false, message: error.message });
  // }
};

export default scrap;
