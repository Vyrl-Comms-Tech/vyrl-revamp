import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

for (let i = 0; i < 40; i++) {
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(150);
}
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const spacer = [...document.querySelectorAll(".pin-spacer")].find((el) =>
    el.firstElementChild?.classList?.contains("image-orbit")
  );
  const spacerRect = spacer.getBoundingClientRect();
  const spacerDocTop = spacerRect.top + window.scrollY;
  const footer = document.querySelector(".footer");

  return {
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    spacerDocTop,
    spacerHeight: spacerRect.height,
    spacerDocBottom: spacerDocTop + spacerRect.height,
    footerPosition: getComputedStyle(footer).position,
    footerTransform: getComputedStyle(footer).transform,
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
