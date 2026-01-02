import { test, expect, chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Highlighting UI", () => {
  const pathToExtension = path.resolve(__dirname, "../../dist");
  let context: any;

  test.beforeEach(async ({}, testInfo) => {
    const userDataDir = path.resolve(
      __dirname,
      `../../.tmp/test-user-data-${testInfo.title.replace(/\s+/g, "-")}`
    );
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

  test("trigger button appears on text selection (>= 10 chars)", async () => {
    const page = await context.newPage();
    await page.goto("https://example.com");
    await page.waitForTimeout(2000);

    // Select text "Example Domain" (14 chars)
    await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (h1) {
        const range = document.createRange();
        range.selectNodeContents(h1);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const triggerButton = page
      .locator("#openinsight-root")
      .locator('button[aria-label="Analyze with OpenInsight"]');
    await expect(triggerButton).toBeVisible({ timeout: 10000 });
  });

  test("trigger button does not appear for short selection (< 10 chars)", async () => {
    const page = await context.newPage();
    await page.goto("https://example.com");
    await page.waitForTimeout(2000);

    // Select short text "Domain" (6 chars)
    await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (h1) {
        const range = document.createRange();
        const textNode = h1.firstChild!;
        range.setStart(textNode, 8); // "Domain" starts at index 8 in "Example Domain"
        range.setEnd(textNode, 14);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const triggerButton = page
      .locator("#openinsight-root")
      .locator('button[aria-label="Analyze with OpenInsight"]');
    await expect(triggerButton).not.toBeVisible({ timeout: 5000 });
  });

  test("trigger button does not appear for non-alphabetic selection", async () => {
    const page = await context.newPage();
    await page.goto("https://example.com");
    await page.waitForTimeout(2000);

    // Add some numbers/symbols to the page and select them
    await page.evaluate(() => {
      const div = document.createElement("div");
      div.id = "non-alpha";
      div.innerText = "1234567890!@#";
      document.body.appendChild(div);

      const range = document.createRange();
      range.selectNodeContents(div);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });

    const triggerButton = page
      .locator("#openinsight-root")
      .locator('button[aria-label="Analyze with OpenInsight"]');
    await expect(triggerButton).not.toBeVisible({ timeout: 5000 });
  });

  test("fact check tab is hidden for selection <= 50 chars", async () => {
    const page = await context.newPage();
    await page.goto("https://example.com");
    await page.waitForTimeout(2000);

    // Select "Example Domain" (14 chars)
    await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (h1) {
        const range = document.createRange();
        range.selectNodeContents(h1);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const root = page.locator("#openinsight-root");
    const triggerButton = root.locator(
      'button[aria-label="Analyze with OpenInsight"]'
    );
    await expect(triggerButton).toBeVisible({ timeout: 10000 });
    await triggerButton.click();

    const popover = root.locator('div[role="dialog"]');
    const factCheckTab = popover.locator(
      'button[role="tab"]:has-text("Fact Check")'
    );
    await expect(factCheckTab).not.toBeVisible();
  });

  test("tab switching between Explain and Fact Check views (long selection)", async () => {
    const page = await context.newPage();
    await page.goto("https://example.com");
    await page.waitForTimeout(2000);

    // Select a long text (para has ~150 chars)
    await page.evaluate(() => {
      const p = document.querySelector("p");
      if (p) {
        const range = document.createRange();
        range.selectNodeContents(p);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const root = page.locator("#openinsight-root");
    const triggerButton = root.locator(
      'button[aria-label="Analyze with OpenInsight"]'
    );
    await expect(triggerButton).toBeVisible({ timeout: 10000 });
    await triggerButton.click();

    const popover = root.locator('div[role="dialog"]');
    const factCheckTab = popover.locator(
      'button[role="tab"]:has-text("Fact Check")'
    );

    await expect(factCheckTab).toBeVisible({ timeout: 5000 });
    await factCheckTab.click();

    await expect(factCheckTab).toHaveAttribute("aria-selected", "true");
    await expect(
      popover.locator('button[role="tab"]:has-text("Explain")')
    ).toHaveAttribute("aria-selected", "false");

    // Wait for content to load (loading skeleton should disappear)
    await expect(
      popover.locator('[data-testid="loading-skeleton"]')
    ).not.toBeVisible({ timeout: 15000 });

    // Check for either a verdict or an error message (since we might not have a real API key in E2E)
    await expect(
      popover.locator("text=/True|False|Partially True|Unverifiable|Failed/")
    ).toBeVisible();
  });

  test("quick settings toggle and accent color change", async () => {
    const page = await context.newPage();

    await page.goto("https://example.com");

    await page.waitForTimeout(2000);

    // Select text and open modal

    await page.evaluate(() => {
      const h1 = document.querySelector("h1");

      if (h1) {
        const range = document.createRange();

        range.selectNodeContents(h1);

        const selection = window.getSelection();

        selection?.removeAllRanges();

        selection?.addRange(range);

        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const root = page.locator("#openinsight-root");

    await root.locator('button[aria-label="Analyze with OpenInsight"]').click();

    const popover = root.locator('div[role="dialog"]');

    // Open Quick Settings

    await popover.locator('button[title="Settings"]').click();

    await expect(popover.locator('span:has-text("Settings")')).toBeVisible();

    await expect(popover.locator("text=Accent Color")).toBeVisible();

    // Click Indigo accent (the second color button usually)

    // In AnalysisPopover: teal, indigo, rose, amber

    const indigoButton = popover.locator('button[aria-label="indigo"]');

    await indigoButton.click();

    // Verify it changed in the DOM (the popover has data-accent attribute)

    await expect(popover).toHaveAttribute("data-accent", "indigo");

    // Go back

    await popover.locator('button:has-text("Back")').click();

    await expect(
      popover.locator('button[role="tab"]:has-text("Explain")')
    ).toBeVisible();
  });

  test.skip('"Open Full Settings" navigates to options page', async () => {
    const page = await context.newPage();

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto("https://example.com");

    await page.waitForTimeout(2000);

    // Select text and open modal

    await page.evaluate(() => {
      const h1 = document.querySelector("h1");

      if (h1) {
        const range = document.createRange();

        range.selectNodeContents(h1);

        const selection = window.getSelection();

        selection?.removeAllRanges();

        selection?.addRange(range);

        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      }
    });

    const root = page.locator("#openinsight-root");

    await root.locator('button[aria-label="Analyze with OpenInsight"]').click();

    const popover = root.locator('div[role="dialog"]');

    await popover.locator('button[title="Settings"]').click();

    // Click "Open Full Settings" using getByRole

    const openSettingsButton = popover.getByRole("button", {
      name: /open full settings/i,
    });

    await expect(openSettingsButton).toBeVisible();

    await openSettingsButton.click();

    // Wait for the options page to be opened and loaded

    let optionsPage;

    try {
      await expect
        .poll(
          async () => {
            const pages = context.pages();

            optionsPage = pages.find((p) => p.url().includes("options.html"));

            return optionsPage !== undefined;
          },
          { timeout: 15000 }
        )
        .toBe(true);
    } catch (e) {
      const pages = context.pages();

      console.log(
        "Open pages:",
        pages.map((p) => p.url())
      );

      throw e;
    }

    if (optionsPage) {
      await optionsPage.waitForLoadState();

      await expect(optionsPage).toHaveTitle(/OpenInsight Options/);

      await expect(optionsPage.locator("text=Intelligence")).toBeVisible();
    }
  });
});
