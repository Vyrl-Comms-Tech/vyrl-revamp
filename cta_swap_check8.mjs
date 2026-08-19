import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  const primary = el.querySelector('.vyrl-cta__text--primary');
  const chars = Array.from(primary.querySelectorAll('.vyrl-cta__char'));
  const firstCharStyle = chars[0]?.getAttribute('style');
  const firstCharColor = chars[0] ? getComputedStyle(chars[0]).color : null;
  el.classList.add('vyrl-cta--invert');
  const firstCharColorAfter = chars[0] ? getComputedStyle(chars[0]).color : null;
  el.classList.remove('vyrl-cta--invert');
  return { primaryInlineStyle: primary.getAttribute('style'), firstCharStyle, firstCharColor, firstCharColorAfter };
});
console.log(result);

await browser.close();
