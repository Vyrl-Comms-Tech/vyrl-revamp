import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/aboutHero-start.png" });

for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/aboutHero-mid.png" });

for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/aboutHero-end.png" });

await browser.close();
