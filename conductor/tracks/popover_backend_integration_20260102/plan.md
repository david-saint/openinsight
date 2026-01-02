# Implementation Plan - Track: Popover & Backend Integration

## Phase 1: Robust Backend Architecture [checkpoint: 04b754c]

- [x] Task: Define TypeScript interfaces for the new `ExplainResponse` and `FactCheckResponse` schemas in `src/lib/types.ts`. e5b948e
- [x] Task: Extend the existing `BackendClient` class in `src/lib/backend-client.ts` with strictly typed `explainText` and `factCheckText` methods. cfc2bda
- [x] Task: Refactor `background.ts` to extract an `OpenRouterService` class with `fetch` logic, JSON response parsing, and error handling. 51c5605
- [x] Task: Implement `system_prompt` management logic: dynamically construct prompts based on style preference (`Concise` | `Detailed`) and append internal JSON formatting instructions. f56ebca
- [x] Task: Conductor - User Manual Verification 'Robust Backend Architecture' (Protocol in workflow.md) 04b754c

## Phase 2: Smart Popover Logic [checkpoint: 0c90e06]

- [x] Task: Implement text selection listeners with character count validation (10-2000 chars). 604c076
- [x] Task: Add "Fact-check" visibility logic (>50 chars). 1e88e17
- [x] Task: Implement context extraction (paragraph, title, description) for Fact-check requests. cfdce81
- [x] Task: Conductor - User Manual Verification 'Smart Popover Logic' (Protocol in workflow.md) 0c90e06

## Phase 3: Integration & UI Polish

- [x] Task: Update `AnalysisPopover` UI to support the new response structures (Explain and Fact-check views). d08548a
- [x] Task: Connect `AnalysisPopover` to `BackendClient` for `Explain` and `Fact-check` actions. d08548a
- [x] Task: Implement JSON response parsing and render `ExplainResponse` (summary, explanation, optional context/example). d08548a
- [x] Task: Implement JSON response parsing and render `FactCheckResponse` (verdict, details, optional sources with links). d08548a
- [x] Task: Implement error handling in the Popover (display structured error messages from `BackendClient`). d08548a
- [x] Task: Update Options page: replace `system_prompt` editor with a `Style Preference` dropdown (`Concise` | `Detailed`). 1a61723
- [ ] Task: Conductor - User Manual Verification 'Integration & UI Polish' (Protocol in workflow.md)
