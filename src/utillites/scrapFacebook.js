import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ProxyPlugin from 'puppeteer-extra-plugin-proxy';
import chalk from 'chalk';
puppeteer.use(StealthPlugin());
async function scrapFacebook(facebookUrl, ip) {
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

  const browser = await puppeteer.launch({
    timeout: 0,
    headless: 'new',
    args: [
      '--disable-gpu', // Disable GPU hardware acceleration
      '--no-sandbox', // Disable the sandbox to run on Heroku
      '--remote-debugging-port=9222', // Specify the remote debugging port
      '--disable-setuid-sandbox',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.goto(facebookUrl); //{ waitUntil: 'load' } waitUntil: 'networkidle2', timeout: 60000

    const finalUrl = page.url();
    // Check if the final URL is different from the initial URL.
    if (facebookUrl !== finalUrl) {
      console.log(chalk.red(`main scrap The page has redirected`));
      await browser.close();
      return { failed: true };
    }
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    const selector = 'div.x92rtbv';
    const loginModal = await page.$(selector);
    // If the element handle is not null, then the element exists.
    if (loginModal) {
      // Perform the click event on the element because it exists.
      await loginModal.click();
      console.log(chalk.red('close loginModal clicked!'));
    }

    // Current time plus 20 seconds
    const scrollTime = 18000;
    const endTime = Date.now() + scrollTime;
    let passed65percent = false;
    let loginError = false;
    while (Date.now() < endTime) {
      // # check if the element not logged in while scrolling
      const expectedText = 'Not Logged In';
      const notLoggedInError = await page.$x(
        `//*[contains(text(), '${expectedText}')]`
      );

      if (notLoggedInError.length > 0) {
        const elementText = await page.evaluate(
          (el) => el.innerText,
          notLoggedInError[0]
        );
        console.log(
          chalk.red('Element with the expected text found:', elementText)
        );
        loginError = true;
        break;
      }
      // check if scrolling passed 65% and keep track on that
      if (Date.now() - (endTime - scrollTime * 0.25) > 0) {
        passed65percent = true;
        console.log(chalk.blueBright('passed 75%'));
      }

      // Scroll and wait 500ms
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(500);
    }

    // check if passed 65% scrolling time has passed
    if (!passed65percent && loginError) {
      console.log(
        chalk.red(
          'not passed because of scrolling less then 65%. will retry again'
        )
      );
      await browser.close();
      return { failed: true };
    }
    //Now that we scrolled for 15 seconds, let's wait a bit for any final async loads
    await page.waitForTimeout(1000);

    const posts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('div.x3ct3a4'), (ele) => ({
        price: ele.querySelector(
          'a.x1i10hfl div.x78zum5 div.x9f619 div.x1gslohp span.x78zum5 div.x78zum5 span.x193iq5w'
        ).innerText,
        title: ele.querySelector(
          'a.x1i10hfl div.x78zum5 div.x9f619 div.x1gslohp span div.xyqdw3p span.x1lliihq'
        ).innerText,
        imgSrc: ele.querySelector(
          'a.x1i10hfl div.x78zum5 div.x1n2onr6 div.x1n2onr6 div.x1exxf4d div.xhk9q7s div.x78zum5 div.x9f619 img.xt7dq6l'
        ).src,
        location: ele.querySelector(
          'a.x1i10hfl div.x9f619 div.x1gslohp span div.x1iorvi4 span.x193iq5w span.x1lliihq'
        ).innerText,
        postUrl: ele.querySelector('a.x1i10hfl').href,
      }))
    );
    await browser.close();
    console.log('posts.length = ', posts.length);
    return posts;
  } catch (error) {
    console.error('Page is not reachable:');
    await browser.close();
    return { failed: true };
  }
}

export default scrapFacebook;
