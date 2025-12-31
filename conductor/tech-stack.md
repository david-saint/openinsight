# Tech Stack - OpenInsight

## Frontend (UI & Pop-up)
*   **Framework:** React
*   **Styling:** Tailwind CSS (for rapid, utility-first styling consistent with minimalism)
*   **Build Tool:** Vite (for fast development and optimized bundling)

## Extension Core
*   **Language:** TypeScript (for type safety and better developer experience)
*   **Manifest Version:** Chrome Extension Manifest V3
*   **API Communication:** Native `fetch` API for interacting with OpenRouter

## Security & Storage
*   **API Key Storage:** `chrome.storage.local`
*   **Encryption:** Web Cryptography API (for encrypting the OpenRouter API key before storage)
*   **Process Isolation:** Dedicated Background Service Worker for all API interactions, ensuring that the API keys never reside within or are accessible from content scripts (sandboxing).
