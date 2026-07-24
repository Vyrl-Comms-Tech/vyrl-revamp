const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.addInitScript(() => {
    window.sessionStorage.setItem('vyrl-preloader-shown', '1');
  });

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.mouse.wheel(0, 6000);
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 6000);
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 6000);
  await page.waitForTimeout(2000);

  const finalY = await page.evaluate(() => window.scrollY);
  const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  console.log('finalY:', finalY, 'maxScroll:', maxScroll, 'reachedBottom:', finalY >= maxScroll - 100);

  await browser.close();
})();
