const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.setDefaultTimeout(8000);

  await page.addInitScript(() => {
    window.sessionStorage.setItem('vyrl-preloader-shown', '1');
  });

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'domcontentloaded', timeout: 8000 });
  console.log('loaded');
  await page.waitForTimeout(1000);
  console.log('waited 1');

  await page.mouse.wheel(0, 5000);
  console.log('wheeled 1');
  await page.waitForTimeout(500);

  const y1 = await page.evaluate(() => window.scrollY);
  console.log('y1:', y1);

  await browser.close();
  console.log('done');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
