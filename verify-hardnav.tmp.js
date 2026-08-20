const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const navEntries = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navEntries.push(frame.url());
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6500); // let preloader intro finish + skip flag set

  // Click About via keyboard focus+enter (avoids WebGL canvas intercepting clicks)
  await page.evaluate(() => {
    document.querySelector('a[href="/about"].nav-link-item')?.focus();
  });
  await page.keyboard.press("Enter");

  // Poll for url change + verify it's a real navigation (framenavigated fires
  // for hard nav; also check performance.navigation type via Navigation Timing API)
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => ({
      url: location.pathname,
      navType: performance.getEntriesByType("navigation")[0]?.type,
    }));
    console.log(`t+${(i+1)*300}ms`, JSON.stringify(state));
    if (state.url === "/about") break;
  }

  console.log("Frame navigations observed:", navEntries);

  await page.screenshot({ path: "verify-hardnav-about.png" });

  await browser.close();
})();
