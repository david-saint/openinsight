import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('trigger button appears on text selection', async () => {
  const pathToExtension = path.resolve(__dirname, '../../dist');
  const userDataDir = path.resolve(__dirname, '../../.tmp/test-user-data');
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();
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

  // Check for the trigger button inside Shadow DOM
  // Root element ID: openinsight-root
  // Shadow root contains the UI
  const triggerButton = page.locator('#openinsight-root').locator('button[aria-label="Analyze with OpenInsight"]');
  
  // Wait for it to be visible
  await expect(triggerButton).toBeVisible({ timeout: 5000 });

  await context.close();
});