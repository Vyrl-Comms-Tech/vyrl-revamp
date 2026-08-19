import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);

const result = await page.evaluate(() => {
  const el = document.querySelector('.aboutUsStack-cta .vyrl-cta');
  const chain = [];
  let node = el.querySelector('.vyrl-cta__char');
  while (node && node !== el.parentElement) {
    chain.push({
      tag: node.tagName,
      cls: node.className,
      inlineStyle: node.getAttribute('style'),
      computedColor: getComputedStyle(node).color,
    });
    node = node.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(result, null, 2));

await browser.close();
