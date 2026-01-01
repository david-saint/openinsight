# Plan: OpenRouter Backend Integration

## Phase 1: Secure API Key Storage [checkpoint: d4b79e6]

- [x] Task: Implement robust AES-GCM encryption utility using `crypto.subtle` in `src/lib/encryption.ts`. [8eab281]
- [x] Task: Refactor `saveApiKey` and `getApiKey` in `src/lib/settings.ts` to use the new robust encryption. [03e88b0]
- [x] Task: Write unit tests for the new encryption utilities. [499f2fa]
- [x] Task: Conductor - User Manual Verification 'Secure API Key Storage' (Protocol in workflow.md) [d4b79e6]

## Phase 2: Data Structures & Model Caching [checkpoint: da1650b]

- [x] Task: Define TypeScript interfaces for OpenRouter models and API responses in `src/lib/types.ts`. [2daa96f]
- [x] Task: Define TypeScript interfaces for typed error responses (NetworkError, AuthError, RateLimitError, LLMError, UnknownError). [2daa96f]
- [x] Task: Define TypeScript interfaces for LLM prompt settings (temperature, max_tokens, system_prompt). [2daa96f]
- [x] Task: Implement `ModelManager` to handle fetching and caching (24h) the model list in `chrome.storage.local`. [f69e44d]
- [x] Task: Update `DEFAULT_SETTINGS` in `src/lib/settings.ts` with default LLM parameters for Explain and Fact-check. [1458a01]
- [x] Task: Write unit tests for `ModelManager` and settings utilities. [ffb91cd]
- [x] Task: Conductor - User Manual Verification 'Data Structures & Model Caching' (Protocol in workflow.md) [da1650b]

## Phase 3: Background Service Worker Implementation [checkpoint: 104fe22]

- [x] Task: Implement a secure `fetch` utility in `background.ts` that retrieves the encrypted API key for OpenRouter requests. [34e1c77]
- [x] Task: Implement the core logic for the "Explain" prompt, supporting configurable temperature, max_tokens, and system_prompt. [8eb488e]
- [x] Task: Implement the core logic for the "Fact-check" prompt, supporting configurable parameters. [8eb488e]
- [x] Task: Implement the "Test API Key" logic by sending a minimal request to OpenRouter. [2b8cd4f]
- [x] Task: Implement the "Fetch Models" logic to retrieve available models from OpenRouter. [2b8cd4f]
- [x] Task: Implement error differentiation logic to return typed error responses (network, auth, rate-limit, LLM, unknown). [9111d78]
- [x] Task: Write unit tests for background script handlers and error handling. [e37dbaf]
- [x] Task: Conductor - User Manual Verification 'Background Service Worker Implementation' (Protocol in workflow.md) [104fe22]

## Phase 4: Client Abstraction & Messaging [checkpoint: 36e71f5]

- [x] Task: Define the message schema for `BACKEND_EXPLAIN`, `BACKEND_FACT_CHECK`, `BACKEND_FETCH_MODELS`, and `BACKEND_TEST_KEY`. [84b447b]
- [x] Task: Implement the `BackendClient` class in `src/lib/backend-client.ts` to abstract `chrome.runtime.sendMessage` for the UI. [84b447b]
- [x] Task: Design the `BackendClient` class to accommodate future streaming capabilities. [84b447b]
- [x] Task: Register message listeners in the background script to route incoming client requests to the appropriate handlers. [e37dbaf]
- [x] Task: Write unit tests for `BackendClient` messaging and routing. [84b447b]
- [x] Task: Conductor - User Manual Verification 'Client Abstraction & Messaging' (Protocol in workflow.md) [36e71f5]

## Phase 5: Options Page UI for LLM Settings [checkpoint: 6a5b0ac]

- [x] Task: Create UI components for configuring Explain parameters (temperature, max_tokens, system_prompt). [15d14d8]
- [x] Task: Create UI components for configuring Fact-check parameters (temperature, max_tokens, system_prompt). [15d14d8]
- [x] Task: Integrate the new settings components into the Options page following the design philosophy. [15d14d8]
- [x] Task: Write unit tests for the new Options page components. [15d14d8]
- [x] Task: Conductor - User Manual Verification 'Options Page UI for LLM Settings' (Protocol in workflow.md) [6a5b0ac]

## Phase 6: API Key Verification & Toast Notification

- [x] Task: Implement a simple Toast notification component for the Options page. [abed6a2]
- [x] Task: Update the `APIKeySection` component to include a "Test Connection" button. [abed6a2]
- [x] Task: Integrate `BackendClient.testApiKey` into the Options page. [abed6a2]
- [x] Task: Implement visual feedback (checkmark/X) for API key test results. [abed6a2]
- [x] Task: Display error messages in the Toast component upon connection failure. [abed6a2]
- [x] Task: Write unit tests for the Toast component and API key verification flow. [abed6a2]
- [ ] Task: Conductor - User Manual Verification 'API Key Verification & Toast Notification' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'API Key Verification & Toast Notification' (Protocol in workflow.md)

## Phase 7: Final Integration & Verification

- [ ] Task: Perform end-to-end verification of LLM prompting (Explain/Fact-check) via console or temporary UI triggers.
- [ ] Task: Verify all error types are correctly differentiated and returned.
- [ ] Task: Verify encrypted API key storage and retrieval works correctly.
- [ ] Task: Ensure all unit tests pass and code coverage meets requirements (>80%).
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Verification' (Protocol in workflow.md)
