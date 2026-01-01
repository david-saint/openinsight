# Plan: Extension Popup UI Alignment

Redesign the extension popup to follow the epistemic minimalism design philosophy, ensuring theme and accent color synchronization.

## Phase 1: Foundation & Data Loading
- [ ] Task: Create `src/popup/components/PopupHeader.tsx` based on the design in `src/options/components/Header.tsx`.
- [ ] Task: Create unit tests for `Popup.tsx` loading state and settings retrieval in `tests/unit/popup_ui.test.tsx`.
- [ ] Task: Implement settings and accent color retrieval logic in `src/popup/Popup.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Foundation & Data Loading' (Protocol in workflow.md)

## Phase 2: UI Implementation
- [ ] Task: Implement the refined Popup UI with theme-aware containers and the "Open Settings" button.
- [ ] Task: Apply user-selected Accent Color to the button using the `data-accent` attribute pattern.
- [ ] Task: Update unit tests to verify theme application and button functionality.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 3: Final Integration & Polishing
- [ ] Task: Ensure `src/popup/popup.html` and `src/index.css` are correctly configured for the new layout.
- [ ] Task: Run full suite of unit tests and perform manual verification of theme switching.
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Polishing' (Protocol in workflow.md)
