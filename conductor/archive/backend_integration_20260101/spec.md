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
- **Messaging Wrapper:** Create a `BackendClient` class in `src/lib/` to provide a clean, typed interface for UI components to trigger backend actions via `chrome.runtime.sendMessage`. The design should accommodate future streaming capabilities.
- **Core Actions:**
  - `explainText(text, options)`: Sends a prompt to the LLM to explain the provided text. Returns a single, complete response.
  - `factCheckText(text, options)`: Sends a prompt to the LLM to fact-check the provided text. Returns a single, complete response.
  - `testApiKey(apiKey)`: Sends a minimal probe request to OpenRouter to verify the validity of the provided key.
  - `fetchModels()`: Fetches the list of available models from OpenRouter.
- **Configurable Parameters:** Support the following user-configurable parameters for LLM interactions, accessible via the Options page:
  - `temperature` (with sensible defaults for Explanation and Fact-checking).
  - `max_tokens` (with sensible defaults for Explanation and Fact-checking).
  - `system_prompt` (unique defaults for Explanation and Fact-checking).

### 3. Error Handling

- **Error Differentiation:** The backend must differentiate between the following error types and return typed error responses:
  - **Network Error:** Connection failures, timeouts.
  - **Authentication Error:** Invalid or expired API key.
  - **Rate Limit Error:** OpenRouter rate limits exceeded.
  - **LLM Error:** Model-specific errors (e.g., context length exceeded, content policy violation).
  - **Unknown Error:** Any other unexpected error.
- **Responsibility Boundary:** The backend is responsible for returning structured, typed error responses. Visualization (toasts, inline messages) is the responsibility of the consuming UI component (e.g., Options page, AnalysisPopover) and is out of scope for this track.

### 4. Options Page Enhancements

- **API Key Verification:** Add a "Test Connection" button next to the API Key input.
- **Feedback UI:**
  - **Success:** Show a clear visual success indicator (e.g., green checkmark).
  - **Failure:** Show a visual error indicator (e.g., red X) and display the error message in a simple Toast notification.
- **LLM Parameter Settings:** Add UI sections for configuring `temperature`, `max_tokens`, and `system_prompt` for both "Explain" and "Fact-check" actions. The UI must adhere to the project's "Epistemic Minimalism" design philosophy.
- **Toast Component:** Implement a simple, minimal Toast notification component for the Options page to display error messages. This component should follow the project's design philosophy.

## Non-Functional Requirements

- **Security:**
  - Ensure API keys are handled securely in the background script.
  - **Robust Encryption:** API keys must be encrypted using a robust, industry-standard method before storage (not simple obfuscation). Consider using `crypto.subtle` for AES-GCM encryption with a key derived from a stable, unique identifier.
- **Type Safety:** Use TypeScript interfaces for all API requests, responses, and error types.
- **Performance:** Model list fetching should not block the UI. The implementation should be non-blocking and asynchronous.
- **Extensibility:** The `BackendClient` class and message schema should be designed to easily accommodate future enhancements, such as streaming responses.

## Acceptance Criteria

- [ ] API keys are encrypted using a robust, industry-standard method before being stored.
- [ ] List of OpenRouter models is fetched and successfully cached for 24 hours.
- [ ] `BackendClient` class correctly routes "Explain", "Fact-check", "Fetch Models", and "Test Key" requests to the background script.
- [ ] Background script successfully interacts with OpenRouter API using the securely stored API key.
- [ ] Backend returns typed, differentiated error responses (network, auth, rate-limit, LLM, unknown).
- [ ] Options page correctly reflects the success or failure of an API key test, with errors displayed in a Toast.
- [ ] Options page allows users to configure `temperature`, `max_tokens`, and `system_prompt` for Explain and Fact-check actions.
- [ ] Unit tests cover the `BackendClient` messaging, background API logic, and encryption utilities.

## Out of Scope

- Integration with the `AnalysisPopover` or `TriggerButton` (content scripts). This will be a separate track.
- Advanced model filtering (e.g., by cost or context window).
- Streaming responses (will be explored in a future track).
