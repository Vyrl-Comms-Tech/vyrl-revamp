const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000/services", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const initial = await page.evaluate(() => ({
    scrollY: window.scrollY,
    computedBg: getComputedStyle(document.body).backgroundColor,
  }));
  console.log("ON LOAD:", JSON.stringify(initial));
  await page.screenshot({ path: "services-fixed-load.png" });

  // Scroll to center of Slider section to confirm scrub to black still works
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(80);
  }
  const mid = await page.evaluate(() => ({
    scrollY: window.scrollY,
    computedBg: getComputedStyle(document.body).backgroundColor,
  }));
  console.log("AFTER SCROLL:", JSON.stringify(mid));
  await page.screenshot({ path: "services-fixed-scrolled.png" });

  await browser.close();
})();
