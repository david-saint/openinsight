# Track Specification: Popover & Backend Integration

## Overview

This track focuses on the deep integration between the content script UI (`AnalysisPopover`) and the backend services. It introduces strict rules for UI activation (selection length, content context) and enforces a rigid, idempotent JSON structure for LLM responses to ensure reliable parsing and display.

## Functional Requirements

### 1. Smart Popover Activation

- **Selection Thresholds:**
  - The Popover should only appear if the highlighted text is between 10 and 2000 characters.
  - The "Fact-check" action should only be visible/enabled if the highlighted text is > 50 characters.
- **Content Validation:** Selection must contain at least one full word (regex: `\w+`).
- **Context Extraction:** When a user triggers "Fact-check", the content script must extract and include:
  - The full paragraph containing the selection.
  - The page title (`document.title`).
  - The page description (meta `description`).

### 2. Rigid Backend Response Structure

- **JSON Enforcement:** The system prompt for both "Explain" and "Fact-check" must mandate a strict JSON object response.
- **Idempotency:** Prompts must be designed to yield consistent results for the same input.
- **Explain Schema:**
  ```json
  {
    "summary": "A concise explanation of the text.",
    "explanation": "A more detailed breakdown of the concept.",
    "context": {
      // Optional
      "example": "An illustrative example to aid understanding.",
      "related_concepts": ["concept1", "concept2"]
    }
  }
  ```
- **Fact-check Schema:**
  ```json
  {
    "summary": "A brief summary of the claim.",
    "verdict": "True | False | Partially True | Unverifiable",
    "details": "An explanation of the verdict.",
    "sources": [
      // Optional - LLM may not always provide reliable sources
      {
        "title": "Source Title",
        "url": "https://...",
        "snippet": "Relevant quote from the source."
      }
    ]
  }
  ```

### 3. LLM Parameter Control

- **Fixed Parameters:**
  - `temperature`: Fixed at a low value (e.g., 0.1) to ensure consistency.
  - `top_p`, `frequency_penalty`, `presence_penalty`: Hard-coded for optimal factual output.
- **Access Control:**
  - Users can no longer edit the full system prompt (restricting the extensibility introduced in previous versions).
  - Users can only select a **Style Preference**: `"Concise"` or `"Detailed"`.
  - The system prompt is dynamically constructed based on the selected style preference.
  - Core system instructions for JSON formatting and response logic are hidden from the user and appended internally.

### 4. Error Handling

- **Backend Client Errors:** The `BackendClient` must handle and propagate structured error messages from the backend (e.g., network errors, API limits, authentication issues) to the UI components.

## Non-Functional Requirements

- **Reliability:** UI must handle malformed JSON responses gracefully.
- **Privacy:** Context extraction (paragraph, title, description) should only happen when the user explicitly interacts with the popover.

## Acceptance Criteria

- [ ] Popover activation follows the character count (10-2000) and word validation rules.
- [ ] "Fact-check" button visibility/enablement is conditional on selection length (> 50 chars).
- [ ] Backend requests for Fact-check successfully include extracted context (paragraph, title, description).
- [ ] LLM responses are successfully parsed as JSON objects in the content script.
- [ ] Options UI updated to restrict prompt editing and expose only "Style" preferences.
- [ ] Backend client successfully propagates error messages to the UI.
- [ ] Unit tests for selection logic and context extraction.
- [ ] E2E tests for the end-to-end flow from selection to JSON-parsed display (using existing E2E setup).
