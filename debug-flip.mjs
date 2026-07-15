import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const wrap = document.querySelector(".aboutHero-imageWrap");
  const target = document.querySelector(".aboutHero-target");
  if (!wrap) return "no wrap found";
  const rect = wrap.getBoundingClientRect();
  const style = getComputedStyle(wrap);
  return {
    parentClass: wrap.parentElement.className,
    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    opacity: style.opacity,
    display: style.display,
    visibility: style.visibility,
    position: style.position,
    transform: style.transform,
  };
});
console.log(JSON.stringify(info, null, 2));
console.log("--- logs ---");
console.log(logs.join("\n"));

await browser.close();
