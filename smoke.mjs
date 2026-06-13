// One-off smoke driver: screenshot all three views.
import { chromium } from 'playwright';

const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Master Connected Map');
await page.waitForTimeout(1500); // let fitView settle
await page.screenshot({ path: '/tmp/arch-master.png' });

await page.click('button:has-text("Module Readiness")');
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/arch-readiness.png' });

await page.click('button:has-text("System Posture")');
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/arch-posture.png' });

// Zoom interaction check: zoom in on the master map via controls.
await page.click('button:has-text("Master Connected Map")');
await page.waitForTimeout(800);
for (let i = 0; i < 5; i++) await page.click('.react-flow__controls-zoomin');
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/arch-master-zoomed.png' });

console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
