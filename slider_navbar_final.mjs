import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

for (const y of [0, 1200, 900, 600, 300, 100, 0]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  const navColor = await page.evaluate(() => getComputedStyle(document.querySelector('.nav-bar')).backgroundColor);
  console.log('y=', y, 'navbar=', navColor);
}

await browser.close();
