const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Pre-seed sessionStorage BEFORE navigation so the preloader skip-script
  // kicks in and we test pure scroll behavior, not preloader timing.
  await page.addInitScript(() => {
    window.sessionStorage.setItem('vyrl-preloader-shown', '1');
  });

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const bodyH = await page.evaluate(() => document.body.scrollHeight);
  console.log('body scrollHeight:', bodyH);

  // Scroll repeatedly via wheel, simulating real user scroll, check final position
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);
  const finalY = await page.evaluate(() => window.scrollY);
  const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  console.log('finalY:', finalY, 'maxScroll:', maxScroll, 'reachedBottom:', finalY >= maxScroll - 50);

  await browser.close();
})();
