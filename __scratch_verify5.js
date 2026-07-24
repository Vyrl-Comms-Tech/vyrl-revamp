const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.setDefaultTimeout(8000);

  await page.addInitScript(() => {
    window.sessionStorage.setItem('vyrl-preloader-shown', '1');
  });

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const bodyH = await page.evaluate(() => document.body.scrollHeight);

  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1500);

  const finalY = await page.evaluate(() => window.scrollY);
  const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  console.log('bodyH:', bodyH, 'finalY:', finalY, 'maxScroll:', maxScroll, 'reachedBottom:', finalY >= maxScroll - 100);

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
