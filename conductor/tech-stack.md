# Tech Stack - OpenInsight

## Frontend (UI & Pop-up)

- **Framework:** React
- **Icons:** Lucide React
- **Styling:** Tailwind CSS (for rapid, utility-first styling consistent with minimalism)
- **Build Tool:** Vite with **@crxjs/vite-plugin** (industry-standard Chrome extension bundling with HMR support)

## Extension Core

- **Language:** TypeScript (strict mode enabled)
- **Manifest Version:** Chrome Extension Manifest V3
- **Build Plugin:** `@crxjs/vite-plugin` — handles manifest generation, content script bundling, and hot-reload
- **API Communication:** Native `fetch` API for interacting with OpenRouter

## Messaging & Communication

- **Content Script ↔ Background:** Lightweight typed message wrapper over `chrome.runtime.sendMessage/onMessage`
- **Injection Strategy:** Manifest-declared content scripts (injected on all pages by default)

## Testing

- **Unit Testing:** Vitest (fast, Vite-native test runner)
- **E2E Testing:** Playwright with Chrome extension support (loading unpacked extension in test browser)
- **Coverage Target:** >80%

## Security & Storage

- **API Key Storage:** `chrome.storage.local`
- **Encryption:** Web Cryptography API (for encrypting the OpenRouter API key before storage)
- **Process Isolation:** Background Service Worker handles all API interactions; API keys never exposed to content scripts
