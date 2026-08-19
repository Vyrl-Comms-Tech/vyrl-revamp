import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

const toggle = await page.$('.chatbot-toggle');
if (!toggle) {
  console.log('chatbot toggle not found');
} else {
  await toggle.click();
  await page.waitForTimeout(1000);
  const panel = await page.$('.chatbot-panel');
  const box = await panel.boundingBox();
  await page.screenshot({ path: 'chatbot_open.png', clip: box });
}

await browser.close();
