const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Visit home first, click through preloader, so sessionStorage marks it seen
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("Let\'s get started")');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(4000); // let dissolve finish
  }

  await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const before = await page.evaluate(() => ({ scrollY: window.scrollY, bodyH: document.body.scrollHeight }));
  console.log('before scroll', before);

  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(1000);

  const after = await page.evaluate(() => ({ scrollY: window.scrollY, bodyH: document.body.scrollHeight }));
  console.log('after wheel scroll', after);

  const fixedEls = await page.evaluate(() => {
    const all = document.querySelectorAll('body *');
    const results = [];
    all.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        const rect = el.getBoundingClientRect();
        results.push({
          tag: el.tagName,
          cls: el.className && el.className.toString().slice(0,80),
          position: cs.position,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        });
      }
    });
    return results;
  });
  console.log('fixed/sticky elements:', JSON.stringify(fixedEls, null, 2));

  await page.screenshot({ path: '/tmp/pp-after-scroll.png', fullPage: false });
  await browser.close();
})();
