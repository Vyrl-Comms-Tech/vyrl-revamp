const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("Let\'s get started")');
  console.log('button found:', !!btn);
  if (btn) {
    await btn.click();
    console.log('clicked');
  }
  await page.waitForTimeout(6000);

  const state = await page.evaluate(() => {
    const el = document.querySelector('[class*="Preloader-module"]');
    if (!el) return 'UNMOUNTED';
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, dataInert: el.getAttribute('data-inert') };
  });
  console.log('preloader state after 6s:', state);

  await browser.close();
})();
