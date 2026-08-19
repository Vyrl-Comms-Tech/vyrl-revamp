import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  el.classList.add('vyrl-cta--invert');
  const rootColor = getComputedStyle(el).color;
  const primary = el.querySelector('.vyrl-cta__text--primary');
  const primaryColor = getComputedStyle(primary).color;
  const primaryOwnColor = primary.style.color;
  el.classList.remove('vyrl-cta--invert');
  return { rootColor, primaryColor, primaryOwnColor, primaryClass: primary.className };
});
console.log(result);

await browser.close();
