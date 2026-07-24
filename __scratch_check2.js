const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("Let\'s get started")');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(4500);
  }

  const preloaderStateHome = await page.evaluate(() => {
    const el = document.querySelector('[class*="Preloader-module"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, pointerEvents: cs.pointerEvents, display: cs.display, dataInert: el.getAttribute('data-inert') };
  });
  console.log('preloader state on home after click-through:', preloaderStateHome);

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const preloaderStatePP = await page.evaluate(() => {
    const el = document.querySelector('[class*="Preloader-module"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, pointerEvents: cs.pointerEvents, display: cs.display, dataInert: el.getAttribute('data-inert') };
  });
  console.log('preloader state on /privacy-policy:', preloaderStatePP);

  // Now scroll test with careful before/after screenshot
  await page.screenshot({ path: '/tmp/pp-top.png' });
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/pp-scrolled.png' });
  const scrollInfo = await page.evaluate(() => window.scrollY);
  console.log('scrollY after wheel+wait:', scrollInfo);

  await browser.close();
})();
