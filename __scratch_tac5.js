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
  await page.screenshot({ path: 'C:/Users/DELL/AppData/Local/Temp/claude/e--vyrl-revamp-vyrl-revamp/950a89f9-73b6-44d3-ac7f-3fbb19c8dfc2/scratchpad/tac-fixed.png' });
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
