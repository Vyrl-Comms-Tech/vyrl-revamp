import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  el.className = 'vyrl-cta vyrl-cta--invert'; // hard-set, remove solid entirely
  const primary = el.querySelector('.vyrl-cta__text--primary');
  const color = getComputedStyle(primary).color;
  const rootClass = el.className;
  return { color, rootClass };
});
console.log(result);

await browser.close();
