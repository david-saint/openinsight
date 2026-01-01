import { test, expect, chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("options page saves API key to storage", async () => {
  const pathToExtension = path.resolve(__dirname, "../../dist");
  const userDataDir = path.resolve(
    __dirname,
    "../../.tmp/test-user-data-storage"
  );

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();

  // Navigate to a real page first to trigger extension loading
  await page.goto("https://example.com");

  // Wait for the service worker to be registered (with timeout)
  let worker = context.serviceWorkers()[0];
  if (!worker) {
    worker = await context.waitForEvent("serviceworker", { timeout: 10000 });
  }
  const workerUrl = worker.url();
  const id = workerUrl.split("/")[2];

  await page.goto(`chrome-extension://${id}/src/options/options.html`);

  const input = page.locator("#api-key");

  // Fill the input and blur to trigger auto-save
  await input.fill("test-api-key-123");
  await input.blur();

  // Wait for the auto-save to complete
  await page.waitForTimeout(500);

  // Verify in storage
  const storageValue = await page.evaluate(async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get("openrouter_api_key", (result) => {
        resolve(result.openrouter_api_key);
      });
    });
  });

  // The stored value should NOT be the plain text key anymore, it should be encrypted
  expect(storageValue).not.toBe("test-api-key-123");
  expect(typeof storageValue).toBe("string");
  expect((storageValue as string).length).toBeGreaterThan(20); // Basic check for encrypted blob

  await context.close();
});
