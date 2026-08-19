import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3001/about', { waitUntil: 'networkidle', timeout: 30000 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

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

// Also directly check stylesheet rule order for these two selectors
const rules = await page.evaluate(() => {
  const found = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === '.vyrl-cta--solid' || rule.selectorText === '.vyrl-cta--invert') {
          found.push({ selector: rule.selectorText, cssText: rule.cssText, href: sheet.href });
        }
      }
    } catch(e) {}
  }
  return found;
});
console.log(JSON.stringify(rules, null, 2));

await browser.close();
