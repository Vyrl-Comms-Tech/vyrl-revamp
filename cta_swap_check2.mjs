import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:3000/about', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2000);

for (const frac of [0.3, 0.4, 0.5, 0.6]) {
  await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), frac);
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const stack = document.querySelector('.aboutUsStack');
    const cta = document.querySelector('.aboutUsStack-cta');
    const vyrl = cta?.querySelector('.vyrl-cta');
    const anyErr = document.querySelector('.aboutUsStack-cta')?.innerHTML?.slice(0,300);
    return {
      stackExists: !!stack,
      ctaExists: !!cta,
      vyrlExists: !!vyrl,
      ctaHTML: anyErr,
    };
  });
  console.log('frac', frac, JSON.stringify(info));
}

await browser.close();
