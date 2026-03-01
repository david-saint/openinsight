# Specification - Track: Keyword Emphasis in Analysis

## Overview
This feature introduces the ability for users to selectively emphasize specific words within the highlighted text to guide the LLM to provide deeper insights or prioritize certain terms in its response. The UX is optimized for immediate results, with the option to refine the analysis through keyword emphasis.

## Functional Requirements
- **Immediate Analysis:**
    - When the `AnalysisPopover` opens, it should immediately trigger the default analysis (Explain or Fact-check) without requiring any prior word selection.
- **Word Selection & Refinement:**
    - The `AnalysisPopover` will provide a way to see the original highlighted text as individual, clickable word tokens alongside or within the analysis view.
    - Users can click/tap any word to toggle its "emphasized" state.
    - **Limit:** A user can emphasize a maximum of **3 words** at a time. FIFO behavior applies.
- **Regeneration:**
    - After changing the emphasis of words, a "Regenerate" or "Update Analysis" button becomes available (or active) to re-fetch the analysis with the new keywords.
- **LLM Integration:**
    - When a request is sent to `BACKEND_EXPLAIN` or `BACKEND_FACT_CHECK`, the list of emphasized words is included in the message payload.
    - The `PromptManager` updates the system prompt to prioritize these keywords.
- **Visual Feedback:**
    - Emphasized words in the selection area will be styled using the current user-selected **Accent Color** and a subtle underline.

## UI/UX Design
- **Interaction Flow:**
    1.  User highlights text on a webpage.
    2.  User clicks the `TriggerButton`.
    3.  `AnalysisPopover` opens and **immediately starts loading** the analysis.
    4.  (Optional) User toggles word emphasis in the configuration area.
    5.  (Optional) User clicks "Regenerate" to update the analysis with emphasized keywords.

## Acceptance Criteria
- [ ] Analysis starts immediately when the popover is opened.
- [ ] Users can toggle word emphasis at any time.
- [ ] Clicking "Regenerate" (or similar) updates the analysis using the current emphasis.
- [ ] Visual styling (accent color + underline) applies to emphasized words.
- [ ] The background service worker correctly receives the updated emphasized words.

## Out of Scope
- Multi-word phrase selection.
- Persistent emphasis across different selections.
