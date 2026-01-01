import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Highlighting UI', () => {
  const pathToExtension = path.resolve(__dirname, '../../dist');
  let context: any;

  test.beforeEach(async ({}, testInfo) => {
    const userDataDir = path.resolve(__dirname, `../../.tmp/test-user-data-${testInfo.title.replace(/\s+/g, '-')}`);
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('trigger button appears on text selection', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Wait for extension to load
    await page.waitForTimeout(2000);

    // Select text
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const range = document.createRange();
        range.selectNodeContents(h1);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    });

    const triggerButton = page.locator('#openinsight-root').locator('button[aria-label="Analyze with OpenInsight"]');
    await expect(triggerButton).toBeVisible({ timeout: 10000 });
  });

  test('modal opens on trigger click with Explain tab active', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Wait for extension to load
    await page.waitForTimeout(2000);

    // Select text
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const range = document.createRange();
        range.selectNodeContents(h1);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    });

    const root = page.locator('#openinsight-root');
    const triggerButton = root.locator('button[aria-label="Analyze with OpenInsight"]');
    
    await expect(triggerButton).toBeVisible({ timeout: 10000 });
    await triggerButton.click();

    const popover = root.locator('div[role="dialog"]');
    await expect(popover).toBeVisible();

        const explainTab = popover.locator('button[role="tab"][aria-selected="true"]');

        await expect(explainTab).toContainText('Explain');

      });

    

      test('tab switching between Explain and Fact Check views', async () => {

        const page = await context.newPage();

        await page.goto('https://example.com');

    

        await page.waitForTimeout(2000);

    

        // Select text

        await page.evaluate(() => {

          const h1 = document.querySelector('h1');

          if (h1) {

            const range = document.createRange();

            range.selectNodeContents(h1);

            const selection = window.getSelection();

            selection?.removeAllRanges();

            selection?.addRange(range);

            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

          }

        });

    

        const root = page.locator('#openinsight-root');

        const triggerButton = root.locator('button[aria-label="Analyze with OpenInsight"]');

        await triggerButton.click();

    

        const popover = root.locator('div[role="dialog"]');

        const factCheckTab = popover.locator('button[role="tab"]:has-text("Fact Check")');

        

        await factCheckTab.click();

    

        await expect(factCheckTab).toHaveAttribute('aria-selected', 'true');

        await expect(popover.locator('button[role="tab"]:has-text("Explain")')).toHaveAttribute('aria-selected', 'false');

        

        // Check for fact check specific content (Verified badge)

        await expect(popover.locator('text=Verified')).toBeVisible();

      });

    });

    