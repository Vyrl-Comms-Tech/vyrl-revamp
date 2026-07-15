import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("http://localhost:3000/services", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
console.log("Errors:", errors.join("\n") || "none");
await page.screenshot({ path: "/tmp/slider-check.png" });

await browser.close();
