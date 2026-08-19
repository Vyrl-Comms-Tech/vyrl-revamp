import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);
const before = await page.evaluate(() => {
  const blob = document.querySelector('.aboutUsStack-cta .vyrl-cta__blob');
  return getComputedStyle(blob).backgroundColor;
});
console.log('blob bg before invert (should be black):', before);

await page.evaluate(() => window.scrollTo(0, 4500));
await page.waitForTimeout(400);
const after = await page.evaluate(() => {
  const blob = document.querySelector('.aboutUsStack-cta .vyrl-cta__blob');
  return getComputedStyle(blob).backgroundColor;
});
console.log('blob bg after invert (should be white):', after);

const box = await page.$('.aboutUsStack-cta');
const bbox = await box.boundingBox();
await page.screenshot({ path: 'desktop_cta_invert.png', clip: {x: Math.max(0,bbox.x-20), y: Math.max(0,bbox.y-20), width: bbox.width+40, height: bbox.height+40} });

await browser.close();
