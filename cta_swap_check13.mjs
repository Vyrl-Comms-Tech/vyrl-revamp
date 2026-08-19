import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

let found = false;
for (const y of [500,1000,1500,2000,2500,3000]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
  found = await page.evaluate(() => !!document.querySelector('.aboutUsStack-cta .vyrl-cta'));
  if (found) { console.log('found at y=', y); break; }
}

if (found) {
  const result = await page.evaluate(() => {
    const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
    el.classList.add('vyrl-cta--invert');
    return {
      cls: el.className,
      color: getComputedStyle(el.querySelector('.vyrl-cta__text--primary')).color,
      blob: getComputedStyle(el.querySelector('.vyrl-cta__blob')).backgroundColor,
    };
  });
  console.log(result);

  const rules = await page.evaluate(() => {
    const found = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === '.vyrl-cta--solid' || rule.selectorText === '.vyrl-cta--invert') {
            found.push({ selector: rule.selectorText, cssText: rule.cssText });
          }
        }
      } catch(e) {}
    }
    return found;
  });
  console.log(JSON.stringify(rules, null, 2));
}

await browser.close();
