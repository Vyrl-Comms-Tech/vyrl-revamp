const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6500);

  const linkExists = await page.evaluate(() => !!document.querySelector('a[href="/about"].nav-link-item'));
  console.log("link exists:", linkExists);

  await page.evaluate(() => {
    document.querySelector('a[href="/about"].nav-link-item')?.focus();
  });
  await page.keyboard.press("Enter");

  await page.waitForTimeout(3000);
  const mid = await page.evaluate(() => ({ url: location.pathname }));
  console.log("t+3000ms:", JSON.stringify(mid));
  console.log("Errors so far:", errors);

  await browser.close();
})();
