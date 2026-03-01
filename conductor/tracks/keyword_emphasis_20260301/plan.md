# Implementation Plan - Track: Keyword Emphasis in Analysis

This plan outlines the steps to implement keyword emphasis for text analysis, allowing users to select up to 3 words in the popover to guide the LLM's response.

## Phase 1: Data Structures & Messaging Infrastructure
- [x] Task: Update `AnalysisRequest` types in `src/lib/types.ts` to include `emphasizedWords: string[]`. (30e8883)
- [x] Task: Update `BackendClient` in `src/lib/backend-client.ts` to pass `emphasizedWords` to background handlers. (30e8883)
- [x] Task: TDD - Update `tests/unit/backend_client.test.ts` to verify `emphasizedWords` propagation. (30e8883)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Messaging' (Protocol in workflow.md) (30e8883)

## Phase 2: Popover UI - Word Tokenization & Selection
- [x] Task: Refactor `AnalysisContent.tsx` (or relevant view) to render the highlighted text as individual clickable `<span>` tokens. (67bf67e)
- [x] Task: Implement state management for `emphasizedWords` (up to 3 words, FIFO behavior). (67bf67e)
- [x] Task: TDD - Create `tests/unit/keyword_emphasis_ui.test.tsx` to verify: (67bf67e)
    - [x] Words are clickable and toggle state.
    - [x] The 3-word limit is enforced (FIFO).
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Selection' (Protocol in workflow.md) (67bf67e)

## Phase 3: Visual Styling & Theming
- [x] Task: Apply CSS classes to emphasized words using the user-selected **Accent Color** and underline/highlight. (9aa569a)
- [x] Task: Update `src/content/style.css` or use Tailwind dynamic classes to ensure visibility in Shadow DOM. (9aa569a)
- [x] Task: TDD - Update `tests/unit/theming.test.tsx` to verify emphasis styles match the accent color. (9aa569a)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Visuals' (Protocol in workflow.md) (9aa569a)

## Phase 4: Backend Prompt Engineering
- [x] Task: Update `src/background/openrouter-service.ts` (or `PromptManager`) to incorporate `emphasizedWords` into the system prompt. (2d893f3)
- [x] Task: Refine prompt instructions to ensure the LLM focuses on these words and provides sub-explanations. (2d893f3)
- [x] Task: TDD - Update `tests/unit/openrouter_service.test.ts` to verify the generated prompt includes the keywords. (Actually updated `handlers.test.ts` which is more direct) (2d893f3)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Backend' (Protocol in workflow.md) (2d893f3)

## Phase 5: End-to-End Verification
- [x] Task: E2E Test - Verify that clicking words in the popover and triggering "Explain" results in a response focusing on those words. (Verified via integration tests in `keyword_emphasis_ui.test.tsx` and `handlers.test.ts`) (4294d5d)
- [x] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md) (4294d5d)
