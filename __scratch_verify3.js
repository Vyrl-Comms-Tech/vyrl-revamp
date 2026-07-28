const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await page.addInitScript(() => {
    window.sessionStorage.setItem('vyrl-preloader-shown', '1');
  });

  await page.goto('http://localhost:3000/about', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  const section = await page.$('.draggable-marquee');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  let anomalies = 0;
  const total = 80;
  for (let i = 0; i < total; i++) {
    const gaps = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.draggable-marquee-item'));
      const rects = items
        .map(el => el.querySelector('.draggable-marquee-image').getBoundingClientRect())
        .filter(r => r.width > 0)
        .sort((a, b) => a.left - b.left);
      const results = [];
      for (let i = 1; i < rects.length; i++) {
        results.push(Math.round(rects[i].left - rects[i - 1].right));
      }
      return results;
    });
    const bad = gaps.filter(g => g < 40 || g > 65);
    if (bad.length) {
      anomalies++;
      console.log(`t=${(i*0.25).toFixed(2)}s ANOMALY:`, gaps);
    }
    await page.waitForTimeout(250);
  }
  console.log(`scan complete: ${anomalies} anomalies out of ${total} samples over ${(total*0.25).toFixed(0)}s`);

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
