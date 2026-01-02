# Implementation Plan - Track: Popover & Backend Integration

## Phase 1: Robust Backend Architecture

- [x] Task: Define TypeScript interfaces for the new `ExplainResponse` and `FactCheckResponse` schemas in `src/lib/types.ts`. e5b948e
- [x] Task: Extend the existing `BackendClient` class in `src/lib/backend-client.ts` with strictly typed `explainText` and `factCheckText` methods. cfc2bda
- [x] Task: Refactor `background.ts` to extract an `OpenRouterService` class with `fetch` logic, JSON response parsing, and error handling. 51c5605
- [ ] Task: Implement `system_prompt` management logic: dynamically construct prompts based on style preference (`Concise` | `Detailed`) and append internal JSON formatting instructions.
- [ ] Task: Conductor - User Manual Verification 'Robust Backend Architecture' (Protocol in workflow.md)

## Phase 2: Smart Popover Logic

- [ ] Task: Implement text selection listeners with character count validation (10-2000 chars).
- [ ] Task: Add "Fact-check" visibility logic (>50 chars).
- [ ] Task: Implement context extraction (paragraph, title, description) for Fact-check requests.
- [ ] Task: Conductor - User Manual Verification 'Smart Popover Logic' (Protocol in workflow.md)

## Phase 3: Integration & UI Polish

> **Implementation Note:** When updating `AnalysisPopover`, reuse existing components and use fixed CSS values (e.g., `text-[10px]` instead of `text-xs`, `bg-[#1a1a2e]` instead of `bg-somevariable`).

- [ ] Task: Update `AnalysisPopover` UI to support the new response structures (Explain and Fact-check views).
- [ ] Task: Connect `AnalysisPopover` to `BackendClient` for `Explain` and `Fact-check` actions.
- [ ] Task: Implement JSON response parsing and render `ExplainResponse` (summary, explanation, optional context/example).
- [ ] Task: Implement JSON response parsing and render `FactCheckResponse` (verdict, details, optional sources with links).
- [ ] Task: Implement error handling in the Popover (display structured error messages from `BackendClient`).
- [ ] Task: Update Options page: replace `system_prompt` editor with a `Style Preference` dropdown (`Concise` | `Detailed`).
- [ ] Task: Conductor - User Manual Verification 'Integration & UI Polish' (Protocol in workflow.md)
