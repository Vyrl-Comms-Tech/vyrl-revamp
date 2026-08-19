import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

let found = false;
for (const y of [500,1000,1500,2000,2500,3000,3500,4000]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
  found = await page.evaluate(() => !!document.querySelector('.aboutUsStack-cta .vyrl-cta'));
  if (found) { console.log('found at y=', y); break; }
}

if (found) {
  const result = await page.evaluate(() => {
    const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
    const blobBefore = getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor;
    el.classList.add('vyrl-cta--invert');
    const blobAfter = getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor;
    const textColorAfter = getComputedStyle(el.querySelector('.vyrl-cta__text--primary')).color;
    el.classList.remove('vyrl-cta--invert');
    return { blobBefore, blobAfter, textColorAfter };
  });
  console.log(result);
}

await browser.close();
