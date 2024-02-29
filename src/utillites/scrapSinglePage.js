import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
puppeteer.use(StealthPlugin());
async function scrapSinglePage(url, ip) {
  console.log('ip from scrapSinglePage: ', ip);
  // Launch the browser
  const browser = await puppeteer.launch({
    args: [`--proxy-server=${ip}`],
    // headless: false,
  });
  // Open a new page
  const page = await browser.newPage();
  // Navigate to the target URL
  await page.goto(url);
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  // Scrape the data you need.
  const data = await page.evaluate(() => {
    let postedDate = document.querySelector(
      'div.xyamay9 div.x1xmf6yo div.x1yztbdb div span.x193iq5w'
    )?.innerText;
    // add more data points as needed div.x1xmf5yo div.x1yztbdb div
    return {
      postedDate,
    };
  });
  console.log(data);
  if (!data.hasOwnProperty('postedDate')) {
    console.log(
      chalk.bgRed + ' check url because we could NOT find data ' + url
    );
    await page.screenshot({ path: 'singlePageScrapErr.png', fullPage: true });
    await browser.close();
    return { failed: true };
  }
  // Close the browser
  await browser.close();
  return data;
}
export default scrapSinglePage;
