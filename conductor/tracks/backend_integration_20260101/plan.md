# Plan: OpenRouter Backend Integration

## Phase 1: Data Structures & Model Caching
- [ ] Task: Define TypeScript interfaces for OpenRouter models, API responses, and prompt settings.
- [ ] Task: Implement `ModelManager` to handle fetching and caching (24h) the model list in `chrome.storage.local`.
- [ ] Task: Configure the default model (`google/gemini-2.0-flash-exp:free`) in settings initialization.
- [ ] Task: Conductor - User Manual Verification 'Data Structures & Model Caching' (Protocol in workflow.md)

## Phase 2: Background Service Worker Implementation
- [ ] Task: Implement a secure `fetch` utility in `background.ts` that retrieves the encrypted API key for OpenRouter requests.
- [ ] Task: Implement the core logic for the "Explain" prompt, supporting configurable temperature, max tokens, and system prompts.
- [ ] Task: Implement the core logic for the "Fact-check" prompt, supporting configurable parameters.
- [ ] Task: Implement the "Test API Key" logic by sending a minimal request to OpenRouter.
- [ ] Task: Conductor - User Manual Verification 'Background Service Worker Implementation' (Protocol in workflow.md)

## Phase 3: Client Abstraction & Messaging
- [ ] Task: Define the message schema for `BACKEND_EXPLAIN`, `BACKEND_FACT_CHECK`, `BACKEND_FETCH_MODELS`, and `BACKEND_TEST_KEY`.
- [ ] Task: Implement the `BackendClient` class in `src/lib/` to abstract `chrome.runtime.sendMessage` for the UI.
- [ ] Task: Register message listeners in the background script to route incoming client requests to the appropriate handlers.
- [ ] Task: Conductor - User Manual Verification 'Client Abstraction & Messaging' (Protocol in workflow.md)

## Phase 4: Options Page Integration & Verification
- [ ] Task: Update the `APIKeySection` component to include a "Test Connection" button.
- [ ] Task: Integrate `BackendClient.testApiKey` into the Options page and implement visual feedback (checkmark/X).
- [ ] Task: Add a Toast notification system for displaying detailed error messages upon connection failure.
- [ ] Task: Perform final verification of LLM prompting (Explain/Fact-check) via console or temporary UI triggers to ensure end-to-end functionality.
- [ ] Task: Conductor - User Manual Verification 'Options Page Integration & Verification' (Protocol in workflow.md)
