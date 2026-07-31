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
    const cards = Array.from(document.querySelectorAll('.hs-card'));
    return cards.map(c => {
      const cs = getComputedStyle(c);
      const rect = c.getBoundingClientRect();
      const media = c.querySelector('.hs-card-media');
      const mediaRect = media ? media.getBoundingClientRect() : null;
      return {
        height: cs.height, width: cs.width, position: cs.position,
        rectHeight: rect.height, rectWidth: rect.width,
        mediaHeight: mediaRect?.height, mediaWidth: mediaRect?.width,
      };
    });
  });
  console.log(JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'C:/Users/DELL/AppData/Local/Temp/claude/e--vyrl-revamp-vyrl-revamp/950a89f9-73b6-44d3-ac7f-3fbb19c8dfc2/scratchpad/tac-mobile.png', fullPage: true });
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
