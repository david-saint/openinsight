# Implementation Plan - Track: Keyword Emphasis in Analysis

This plan outlines the steps to implement keyword emphasis for text analysis, allowing users to select up to 3 words in the popover to guide the LLM's response.

## Phase 1: Data Structures & Messaging Infrastructure
- [ ] Task: Update `AnalysisRequest` types in `src/lib/types.ts` to include `emphasizedWords: string[]`.
- [ ] Task: Update `BackendClient` in `src/lib/backend-client.ts` to pass `emphasizedWords` to background handlers.
- [ ] Task: TDD - Update `tests/unit/backend_client.test.ts` to verify `emphasizedWords` propagation.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Messaging' (Protocol in workflow.md)

## Phase 2: Popover UI - Word Tokenization & Selection
- [ ] Task: Refactor `AnalysisContent.tsx` (or relevant view) to render the highlighted text as individual clickable `<span>` tokens.
- [ ] Task: Implement state management for `emphasizedWords` (up to 3 words, FIFO behavior).
- [ ] Task: TDD - Create `tests/unit/keyword_emphasis_ui.test.tsx` to verify:
    - [ ] Words are clickable and toggle state.
    - [ ] The 3-word limit is enforced (FIFO).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Selection' (Protocol in workflow.md)

## Phase 3: Visual Styling & Theming
- [ ] Task: Apply CSS classes to emphasized words using the user-selected **Accent Color** and underline/highlight.
- [ ] Task: Update `src/content/style.css` or use Tailwind dynamic classes to ensure visibility in Shadow DOM.
- [ ] Task: TDD - Update `tests/unit/theming.test.tsx` to verify emphasis styles match the accent color.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visuals' (Protocol in workflow.md)

## Phase 4: Backend Prompt Engineering
- [ ] Task: Update `src/background/openrouter-service.ts` (or `PromptManager`) to incorporate `emphasizedWords` into the system prompt.
- [ ] Task: Refine prompt instructions to ensure the LLM focuses on these words and provides sub-explanations.
- [ ] Task: TDD - Update `tests/unit/openrouter_service.test.ts` to verify the generated prompt includes the keywords.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Backend' (Protocol in workflow.md)

## Phase 5: End-to-End Verification
- [ ] Task: E2E Test - Verify that clicking words in the popover and triggering "Explain" results in a response focusing on those words.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
