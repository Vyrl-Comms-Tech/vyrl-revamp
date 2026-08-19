import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  const before = {
    cls: el.className,
    color: getComputedStyle(el.querySelector('.vyrl-cta__text--primary')).color,
    blob: getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor,
  };

  el.classList.add('vyrl-cta--invert');

  const after = {
    cls: el.className,
    color: getComputedStyle(el.querySelector('.vyrl-cta__text--primary')).color,
    blob: getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor,
  };

  return { before, after };
});
console.log(JSON.stringify(result, null, 2));

await browser.close();
