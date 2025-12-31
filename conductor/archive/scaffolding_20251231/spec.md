# Spec - Chrome Extension Scaffolding

## Goal

Establish the foundational architecture for the OpenInsight Chrome extension using industry-standard tooling. This scaffolding provides the base structure for all future features.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                     Chrome Browser                         │
├────────────────────────────────────────────────────────────┤
│  Content Script (content.ts)                               │
│  - Injected on all pages (manifest-declared)               │
│  - Listens for text selection events                       │
│  - Renders pop-up UI near highlighted text                 │
│  - Sends typed messages to background                      │
├────────────────────────────────────────────────────────────┤
│  Background Service Worker (background.ts)                 │
│  - Receives messages from content script                   │
│  - Handles OpenRouter API calls (fetch)                    │
│  - Manages secure API key storage                          │
│  - Returns responses to content script                     │
├────────────────────────────────────────────────────────────┤
│  Settings Page (options.html)                              │
│  - React UI for API key input                              │
│  - Theme customization                                     │
│  - Model selection                                         │
└────────────────────────────────────────────────────────────┘
```

---

## Scaffolding Tasks

### 1. Scaffold — Project Initialization

Initialize the project with industry-standard Chrome extension tooling:

```bash
npm init -y
npm install vite @crxjs/vite-plugin react react-dom
npm install -D typescript @types/react @types/react-dom @types/chrome
npm install -D tailwindcss postcss autoprefixer
npx tsc --init
npx tailwindcss init -p
```

**Deliverables:**

- `package.json` with dependencies
- `tsconfig.json` with strict mode
- `vite.config.ts` with CRXJS plugin configured
- `tailwind.config.js` with content paths
- `src/` directory structure

### 2. Manifest — Chrome Extension Manifest V3

Create `manifest.json` (or `manifest.ts` for CRXJS type-safety):

**Required Permissions:**

- `storage` — for API key persistence
- `activeTab` — for accessing the current tab
- `scripting` — for content script injection (if needed dynamically)

**Content Scripts:**

- Injected on `<all_urls>` by default
- Matches all http/https pages

**Service Worker:**

- `background.ts` as the background script

### 3. Typed Messaging Bus

Lightweight typed message wrapper for content script ↔ background communication:

**File:** `src/lib/messaging.ts`

```typescript
// Message types
type MessageType = "EXPLAIN" | "FACT_CHECK";

interface Message<T extends MessageType> {
  type: T;
  payload: { text: string };
}

interface Response {
  success: boolean;
  result?: string;
  error?: string;
}

// Typed send/receive utilities
```

### 4. Content Script — Selection Detection

**File:** `src/content/content.ts`

- Listen for `mouseup` events
- Check if text is selected via `window.getSelection()`
- If selection exists, log to console (for scaffolding test)
- Later: render pop-up UI near selection

### 5. Background Service Worker

**File:** `src/background/background.ts`

- Register `chrome.runtime.onMessage` listener
- Handle `EXPLAIN` and `FACT_CHECK` message types
- Stub response for now (actual API integration comes later)

### 6. E2E Test — Text Highlighting

**File:** `tests/e2e/highlighting.spec.ts`

Using Playwright with Chrome extension support:

```typescript
import { test, expect, chromium } from "@playwright/test";

test("highlighting text logs message to console", async () => {
  // Load extension in Chrome
  const pathToExtension = "./dist";
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();
  await page.goto("https://example.com");

  // Select text
  await page.evaluate(() => {
    const range = document.createRange();
    const h1 = document.querySelector("h1");
    range.selectNodeContents(h1!);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });

  // Verify console log (or UI element appears)
  // ...
});
```

---

## Directory Structure

```
openinsight/
├── src/
│   ├── background/
│   │   └── background.ts
│   ├── content/
│   │   └── content.ts
│   ├── lib/
│   │   └── messaging.ts
│   ├── options/
│   │   ├── Options.tsx
│   │   └── options.html
│   └── popup/
│       ├── Popup.tsx
│       └── popup.html
├── tests/
│   ├── unit/
│   │   └── messaging.test.ts
│   └── e2e/
│       └── highlighting.spec.ts
├── manifest.json (or manifest.ts)
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Security Considerations

- API key stored encrypted in `chrome.storage.local`
- Background service worker is the only component with API key access
- Content scripts communicate via typed messages only
- Strict Content Security Policy in manifest
