const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Scroll deep into /about, past DraggableMarquee (later section, sets
  // backgroundColor specifically), to catch the exact scenario reported.
  for (let i = 0; i < 30; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (i + 1) * 400);
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(1000);

  const beforeNav = await page.evaluate(() => ({
    scrollY: window.scrollY,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyInlineBg: document.body.style.background || null,
    bodyInlineBgColor: document.body.style.backgroundColor || null,
  }));
  console.log("before nav (/about, scrolled deep):", JSON.stringify(beforeNav));

  await page.evaluate(() => {
    document.querySelector('a[href="/"].nav-link-item')?.focus();
  });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => ({
    url: location.pathname,
    scrollY: window.scrollY,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyInlineBg: document.body.style.background || null,
    bodyInlineBgColor: document.body.style.backgroundColor || null,
  }));
  console.log("after nav to home:", JSON.stringify(info));
  await page.screenshot({ path: "final-check.png" });
  await browser.close();
})();
