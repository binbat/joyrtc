import which from 'which';
import { chromium } from 'playwright-core';

/**
 * @param {number} port
 */
export async function startBrowser(port) {
  const browser = await chromium.launch({
    executablePath: await which('chromium'),
    // headless: false
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/index.html`);
}
