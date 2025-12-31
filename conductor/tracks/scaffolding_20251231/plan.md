# Plan - Chrome Extension Scaffolding (20251231)

This plan outlines the steps to build the foundational scaffolding for the OpenInsight Chrome extension, adhering to the updated architecture using Vite, CRXJS, and React.

## Phase 1: Project Initialization & Scaffolding

- [x] Task: Initialize project with Vite, CRXJS, React, TypeScript, and Tailwind CSS (9365989)
- [x] Task: Configure `vite.config.ts` with CRXJS and `manifest.ts` (650ee48)
- [x] Task: Create project directory structure (`src/background`, `src/content`, `src/options`, `src/popup`, `src/lib`) (883c5e7)
- [ ] Task: Conductor - User Manual Verification 'Project Initialization' (Protocol in workflow.md)

## Phase 2: Messaging Infrastructure & Core Logic

- [ ] Task: Implement typed messaging bus in `src/lib/messaging.ts`
- [ ] Task: Create `src/background/background.ts` with message listeners
- [ ] Task: Create `src/content/content.ts` with text selection detection
- [ ] Task: Implement E2E test for text selection and messaging using Playwright
- [ ] Task: Conductor - User Manual Verification 'Messaging & Core Logic' (Protocol in workflow.md)

## Phase 3: Settings & Secure Storage

- [ ] Task: Implement `src/lib/encryption.ts` (Web Crypto API) and `src/lib/storage.ts` (chrome.storage wrapper)
- [ ] Task: Build `src/options/Options.tsx` for API key management using React & Tailwind
- [ ] Task: Verify secure storage flow via unit and E2E tests
- [ ] Task: Conductor - User Manual Verification 'Settings & Secure Storage' (Protocol in workflow.md)

## Phase 4: Final Verification

- [ ] Task: Final manual verification of the extension in Chrome (Developer Mode)
- [ ] Task: Final code review and cleanup
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
