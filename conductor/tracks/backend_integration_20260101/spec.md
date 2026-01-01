# Track Specification: OpenRouter Backend Integration

## Overview
This track focuses on building the core "backend" infrastructure for OpenInsight. This includes a robust abstraction for interacting with the OpenRouter API, managing available models, and securely handling LLM prompts for text explanation and fact-checking. It also includes adding a feature to verify the user's API key from the Options page.

## Functional Requirements

### 1. OpenRouter Model Management
- **Fetch & Cache:** Implement a mechanism to fetch the list of available models from OpenRouter's API.
- **Caching:** Store the fetched list in `chrome.storage.local` with a 24-hour expiration to optimize performance and reduce API load.
- **Default Model:** Set `google/gemini-2.0-flash-exp:free` as the default model for new installations.

### 2. Secure Prompting Abstraction
- **Backend Isolation:** All OpenRouter API requests must be performed within the Background Service Worker. API keys must never be exposed to content scripts.
- **Messaging Wrapper:** Create a `BackendClient` in `src/lib/` to provide a clean, typed interface for UI components to trigger backend actions via `chrome.runtime.sendMessage`.
- **Core Actions:**
    - `explainText(text, options)`: Sends a prompt to the LLM to explain the provided text.
    - `factCheckText(text, options)`: Sends a prompt to the LLM to fact-check the provided text.
    - `testApiKey(apiKey)`: Sends a minimal probe request to OpenRouter to verify the validity of the provided key.
- **Configurable Parameters:** Support the following parameters for LLM interactions:
    - `temperature`
    - `max_tokens`
    - `system_prompt` (unique defaults for Explanation and Fact-checking).

### 3. Options Page Enhancements
- **API Key Verification:** Add a "Test Connection" button next to the API Key input.
- **Feedback UI:**
    - **Success:** Show a clear visual success indicator (e.g., green checkmark).
    - **Failure:** Show a visual error indicator (e.g., red X) and display the error message in a toast notification.

## Non-Functional Requirements
- **Security:** Ensure API keys are handled securely in the background script.
- **Type Safety:** Use TypeScript interfaces for all API requests and responses.
- **Performance:** Model list fetching should not block the UI.

## Acceptance Criteria
- [ ] List of OpenRouter models is fetched and successfully cached for 24 hours.
- [ ] `BackendClient` correctly routes "Explain", "Fact-check", and "Test Key" requests to the background script.
- [ ] Background script successfully interacts with OpenRouter API using the stored (encrypted) API key.
- [ ] Options page correctly reflects the success or failure of an API key test.
- [ ] Unit tests cover the `BackendClient` messaging and background API logic.

## Out of Scope
- Integration with the `AnalysisPopover` or `TriggerButton` (content scripts).
- Advanced model filtering (e.g., by cost or context window).
