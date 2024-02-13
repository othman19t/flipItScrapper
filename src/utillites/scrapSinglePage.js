import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
// const puppeteer = require('puppeteer');
async function scrapSinglePage(url) {
  // Launch the browser
  const browser = await puppeteer.launch(); //{ headless: false }
  // Open a new page
  const page = await browser.newPage();
  // Navigate to the target URL
  await page.goto(url);

  // Consider waiting for a specific element if necessary
  // await page.waitForSelector('yourSelector');

  // Scrape the data you need.
  // You will need to define the selectors for the data you are interested in.
  // The example below assumes you are extracting the title using a fictional selector.
  const data = await page.evaluate(() => {
    let postedDate = document.querySelector(
      'div.xyamay9 div.x1xmf6yo div.x1yztbdb div span.x193iq5w'
    )?.innerText;
    // add more data points as needed div.x1xmf5yo div.x1yztbdb div
    return {
      postedDate,
    };
  });

  // Take a screenshot
  //   await page.screenshot({ path: 'screenshot.png' });

  // Log the scraped data to the console
  console.log(data);

  //   await page.screenshot({
  //     path: 'screenshot.png',
  //     fullPage: true, // Capture the full page
  //   });
  // Close the browser
  await browser.close();
  return data;
}

// Replace 'yourURL' with the actual URL of the item
// const url =
//   'https://www.facebook.com/marketplace/item/409371355000968/?ref=search&referral_code=null&referral_story_type=post';
// scrapSinglePage(url).catch(console.error);
export default scrapSinglePage;
