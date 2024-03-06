import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ProxyPlugin from 'puppeteer-extra-plugin-proxy';
import chalk from 'chalk';

puppeteer.use(StealthPlugin());
async function scrapSinglePage(url, ip) {
  console.log('ip from scrapSinglePage: ', ip);
  puppeteer.use(
    ProxyPlugin({
      address: ip.ip,
      port: ip.port,
      credentials: {
        username: ip.username,
        password: ip.password,
      },
    })
  );
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--disable-gpu', // Disable GPU hardware acceleration
      '--no-sandbox', // Disable the sandbox to run on Heroku
      '--remote-debugging-port=9222', // Specify the remote debugging port
      '--disable-setuid-sandbox',
    ],
  });
  // Open a new page
  const page = await browser.newPage();
  // Navigate to the target URL
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // const finalUrl = page.url();
  // // Check if the final URL is different from the initial URL.
  // if (url !== finalUrl) {
  //   console.log(
  //     chalk.red(`singlescrap The page has redirected error => ${url}`)
  //   );
  //   await browser.close();
  //   return { failed: true };
  // }

  const expectedText1 = 'Not Logged In';
  const expectedText2 = 'You must log in to continue.';
  const notLoggedInError = await page.$x(
    `//*[contains(text(), '${expectedText1}')]`
  );
  const mustLoginError = await page.$x(
    `//*[contains(text(), '${expectedText2}')]`
  );

  if (notLoggedInError?.length > 0 || mustLoginError?.length > 0) {
    const elementText = await page.evaluate(
      (el) => el?.innerText,
      notLoggedInError[0]
    );
    console.log(chalk.red('single scrap Not Logged In error:', elementText));
    await browser.close();
    return { failed: true };
  }
  // Scrape the data you need.
  const lookForDate = await page.evaluate(
    () =>
      document.querySelector(
        'div.xyamay9 div.x1xmf6yo div.x1yztbdb div span.x193iq5w'
      )?.innerText
  );
  const lookForDescription = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      ' div.xb57i2i div.x78zum5 div div.x1n2onr6 div.x9f619 div.x9f619 div.xz9dl7a div span.x193iq5w'
    );
    return Array.from(elements, (element) => element.innerText);
  });

  const data = {
    date: lookForDate,
    description: lookForDescription[lookForDescription?.length - 1],
  };
  console.log('lookForDescription', lookForDescription);
  console.log('data: ', data);
  // Close the browser
  await browser.close();
  return data;
}
export default scrapSinglePage;
