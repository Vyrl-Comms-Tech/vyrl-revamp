import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

// step scroll in smaller increments, checking each time
for (let y = 0; y <= 6000; y += 300) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(200);
  const info = await page.evaluate(() => {
    const cta = document.querySelector('.aboutUsStack-cta .vyrl-cta');
    return cta ? cta.className : null;
  });
  if (info) console.log('y=', y, 'class=', info);
}

await browser.close();
