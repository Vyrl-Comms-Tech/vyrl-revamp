const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
  await page.addInitScript(() => window.sessionStorage.setItem('vyrl-preloader-shown', '1'));
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const section = await page.$('.hs-cards-section');
  if (section) await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const card = document.querySelector('.hs-card');
    const cs = getComputedStyle(card);
    return { flex: cs.flex, flexGrow: cs.flexGrow, flexShrink: cs.flexShrink, flexBasis: cs.flexBasis, height: cs.height, minHeight: cs.minHeight, transform: cs.transform };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
