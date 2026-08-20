const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(11500);
  const flag1 = await page.evaluate(() => sessionStorage.getItem("vyrl-preloader-shown"));
  console.log("sessionFlag after first load:", flag1);

  await page.reload({ waitUntil: "domcontentloaded" });
  console.log("reload triggered");

  await browser.close();
})();
