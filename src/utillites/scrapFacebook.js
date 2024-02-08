import puppeteer from 'puppeteer';
async function scrapFacebook(facebookUrl) {
  const browser = await puppeteer.launch(); // { headless: false }
  const page = await browser.newPage();

  await page.goto(facebookUrl);
  //************** */
  // Current time plus 2 seconds
  const endTime = Date.now() + 2000;

  while (Date.now() < endTime) {
    // Scroll and wait 500ms
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitForTimeout(500);
  }

  //Now that we scrolled for 15 seconds, let's wait a bit for any final async loads
  await page.waitForTimeout(2000);

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
      postHref: ele.querySelector('a.x1i10hfl').href,
    }))
  );
  await browser.close();
  return posts;
}

export default scrapFacebook;
