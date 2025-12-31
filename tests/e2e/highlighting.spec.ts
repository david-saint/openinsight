import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('text selection logs message to console', async () => {
  const pathToExtension = path.resolve(__dirname, '../../dist');
  
  const userDataDir = path.resolve(__dirname, '../../.tmp/test-user-data');
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Extensions only work in headful mode
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();
  
  // Create a promise that resolves when the expected log appears
  const logPromise = new Promise((resolve) => {
    page.on('console', (msg) => {
      if (msg.text() === 'Text selected: Example Domain') {
        resolve(true);
      }
    });
  });

  await page.goto('https://example.com');

  // Select text using the Selection API
  await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
      const range = document.createRange();
      range.selectNodeContents(h1);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Dispatch mouseup event to trigger our listener
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    }
  });

  const logFound = await Promise.race([
    logPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for console log')), 5000))
  ]);

  expect(logFound).toBe(true);

  await context.close();
});
