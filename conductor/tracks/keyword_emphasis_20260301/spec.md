# Specification - Track: Keyword Emphasis in Analysis

## Overview
This feature introduces the ability for users to selectively emphasize specific words within the highlighted text before triggering an analysis (Explain or Fact-check). By emphasizing keywords, users can guide the LLM to provide deeper insights or prioritize certain terms in its response.

## Functional Requirements
- **Word Selection:**
    - The `AnalysisPopover` should display the original highlighted text as individual, clickable word tokens.
    - Users can click/tap any word to toggle its "emphasized" state.
    - **Limit:** A user can emphasize a maximum of **3 words** at a time. If they try to emphasize a 4th, the first one selected should automatically de-emphasize (FIFO) or a toast notification should appear. (Let's go with a FIFO behavior for a smoother experience).
- **LLM Integration:**
    - When a request is sent to `BACKEND_EXPLAIN` or `BACKEND_FACT_CHECK`, the list of emphasized words must be included in the message payload.
    - The `PromptManager` in the background script will update the system prompt to:
        1.  Prioritize these words as "keywords of interest".
        2.  Provide a brief sub-explanation or deeper context for each emphasized word within the overall response.
- **Visual Feedback:**
    - Emphasized words in the popover will be styled using the current user-selected **Accent Color**.
    - Emphasized words will also have a subtle **underline or background highlight** to distinguish them from the rest of the text.

## UI/UX Design
- **Interaction Flow:**
    1.  User highlights text on a webpage.
    2.  User clicks the `TriggerButton`.
    3.  `AnalysisPopover` opens, showing the text.
    4.  User clicks up to 3 words to emphasize them.
    5.  User clicks "Explain" or "Fact-check".
    6.  LLM returns a response tailored to the emphasized words.

## Acceptance Criteria
- [ ] Users can click words in the `AnalysisPopover` to toggle emphasis.
- [ ] Visual styling (accent color + underline) correctly applies to emphasized words.
- [ ] The "3-word limit" is strictly enforced (FIFO behavior).
- [ ] The background service worker correctly receives the emphasized words.
- [ ] The LLM response includes specific focus/explanation for the emphasized words.

## Out of Scope
- Multi-word phrase selection (only individual words for now).
- Persistent emphasis (emphasis is reset when the popover is closed).
