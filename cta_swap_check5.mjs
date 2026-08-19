import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  if (!el) return { error: 'not found' };
  const blobBefore = getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor;
  el.classList.add('vyrl-cta--invert');
  const blobAfter = getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor;
  el.classList.remove('vyrl-cta--invert');
  return { blobBefore, blobAfter };
});
console.log(result);

await browser.close();
