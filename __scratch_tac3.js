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
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && card.matches(rule.selectorText) && rule.style.height) {
            rules.push({ selector: rule.selectorText, height: rule.style.height, media: rule.parentRule?.conditionText });
          }
          // check inside media rules
          if (rule.cssRules) {
            for (const inner of rule.cssRules) {
              if (inner.selectorText && card.matches(inner.selectorText) && inner.style.height) {
                rules.push({ selector: inner.selectorText, height: inner.style.height, media: rule.conditionText });
              }
            }
          }
        }
      } catch (e) {}
    }
    return rules;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
