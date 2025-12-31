import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('options page saves API key to storage', async () => {
  const pathToExtension = path.resolve(__dirname, '../../dist');
  const userDataDir = path.resolve(__dirname, '../../.tmp/test-user-data-storage');
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();
  
  // Navigate to the options page
  // We need to find the extension ID. CRXJS usually keeps it stable or we can use the chrome-extension:// scheme
  // A better way is to get it from the background page or manifest, but for a simple test we can use a trick
  // Or just navigate to the file directly if we know where it is in the dist
  
  // Extension ID is dynamic in dev but can be found
  await page.goto('chrome://extensions');
  const extensionId = await page.evaluate(async () => {
    const manager = document.querySelector('extensions-manager');
    const itemList = manager?.shadowRoot?.querySelector('extensions-item-list');
    const item = itemList?.shadowRoot?.querySelector('extensions-item');
    return item?.id;
  });

  // If we can't find it easily via chrome://extensions (it's shadowed), 
  // we can use the internal extension URL if we can guess/find it.
  // For Playwright + CRXJS, the extension usually has a predictable path if loaded unpacked.
  
  // Alternative: use the background page to get the ID
  // But let's try a simpler approach: navigate to the file directly using the extension scheme
  // For this to work, we need the ID. Let's try to get it from the background worker.
  
  // Actually, CRXJS in build mode produces a manifest we can read.
  // In this test, we'll just navigate to the options page using the extension ID we'll try to find.
  
  // Let's use a simpler way: since we are testing the 'dist' folder, the ID might be fixed if we provide a key in manifest,
  // but we didn't. Playwright's `backgroundPages()` or `serviceWorkers()` can help.
  
  const [worker] = context.serviceWorkers();
  const workerUrl = worker.url();
  const id = workerUrl.split('/')[2];
  
  await page.goto(`chrome-extension://${id}/src/options/options.html`);

  const input = page.locator('#api-key');
  const saveButton = page.locator('button:has-text("Save Settings")');
  
  await input.fill('test-api-key-123');
  await saveButton.click();
  
  await expect(page.locator('text=Settings saved successfully!')).toBeVisible();

  // Verify in storage
  const storageValue = await page.evaluate(async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get('openrouter_api_key', (result) => {
        resolve(result.openrouter_api_key);
      });
    });
  });

  // The stored value should NOT be the plain text key anymore, it should be encrypted
  expect(storageValue).not.toBe('test-api-key-123');
  expect(typeof storageValue).toBe('string');
  expect((storageValue as string).length).toBeGreaterThan(20); // Basic check for encrypted blob

  await context.close();
});
