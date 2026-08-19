import { chromium } from 'playwright';

const browser = await chromium.launch();

// Desktop check
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);

  const found = await page.evaluate(() => !!document.querySelector('.aboutUsStack-cta .vyrl-cta'));
  console.log('desktop: vyrl-cta found in AboutusStack?', found);

  if (found) {
    const rect = await page.evaluate(() => {
      const el = document.querySelector('.aboutUsStack');
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    });
    console.log('desktop AboutusStack rect', rect);
  }
  await page.close();
}

// Mobile check
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);

  let found = false;
  for (const frac of [0.15, 0.2, 0.25, 0.3]) {
    await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), frac);
    await page.waitForTimeout(500);
    found = await page.evaluate(() => !!document.querySelector('.aboutStackMobile-cta .vyrl-cta'));
    if (found) { console.log('mobile: found vyrl-cta at frac', frac); break; }
  }

  if (found) {
    const clsBefore = await page.evaluate(() => document.querySelector('.aboutStackMobile-cta .vyrl-cta').className);
    console.log('mobile class before scroll past:', clsBefore);
    await page.evaluate(() => document.querySelector('.aboutStackMobile-cta').scrollIntoView({block:'center'}));
    await page.waitForTimeout(500);
    const box = await page.$('.aboutStackMobile-cta');
    const bbox = await box.boundingBox();
    await page.screenshot({ path: 'mobile_cta_before.png', clip: {x: Math.max(0,bbox.x-20), y: Math.max(0,bbox.y-20), width: bbox.width+40, height: bbox.height+40} });

    // scroll further to pass the last card
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await page.waitForTimeout(800);
    const clsAfter = await page.evaluate(() => document.querySelector('.aboutStackMobile-cta .vyrl-cta')?.className);
    console.log('mobile class after scrolling past:', clsAfter);
  }
  await page.close();
}

await browser.close();
