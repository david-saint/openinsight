# Spec - Build the core scaffolding and secure API integration

## Goal
The goal of this track is to establish the foundational architecture for the OpenInsight Chrome extension. This includes setting up the development environment, implementing secure storage for API keys, and creating the background service worker for API communication.

## Architecture
- **Frontend:** React with Tailwind CSS, bundled with Vite.
- **Chrome Extension:** Manifest V3.
- **Security:**
  - API keys stored in `chrome.storage.local`.
  - Keys encrypted using the Web Cryptography API.
  - All API interactions handled by a background service worker to isolate keys from content scripts.

## Key Components
- **Vite/React Scaffold:** The project structure and build pipeline.
- **Encryption Module:** A utility for encrypting and decrypting the OpenRouter API key.
- **Storage Module:** A wrapper around `chrome.storage.local` for secure key management.
- **Background Service Worker:** The central hub for processing "Explain" and "Fact-check" requests.
- **Settings Page:** A simple UI for users to input and manage their OpenRouter API key and theme preferences.

## Security Considerations
- The API key must never be visible in the content script.
- Encryption keys must be managed securely within the extension's context.
- The extension should use a strict Content Security Policy (CSP).
