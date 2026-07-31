const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.addInitScript(() => window.sessionStorage.setItem('vyrl-preloader-shown', '1'));
  await page.goto('http://localhost:3000/this-page-does-not-exist', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'C:/Users/DELL/AppData/Local/Temp/claude/e--vyrl-revamp-vyrl-revamp/950a89f9-73b6-44d3-ac7f-3fbb19c8dfc2/scratchpad/404-enhanced.png' });

  const navExists = await page.$('.site-nav');
  const footerExists = await page.$('.footer');
  console.log('navbar present:', !!navExists, 'footer present:', !!footerExists);

  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
