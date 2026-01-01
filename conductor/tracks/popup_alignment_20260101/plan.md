# Plan: Extension Popup UI Alignment

Redesign the extension popup to follow the epistemic minimalism design philosophy, ensuring theme and accent color synchronization.

## Phase 1: Foundation & Data Loading [checkpoint: 6f8e88e]
- [x] Task: Create `src/popup/components/PopupHeader.tsx` based on the design in `src/options/components/Header.tsx`. 5e2add0
- [x] Task: Create unit tests for `Popup.tsx` loading state and settings retrieval in `tests/unit/popup_ui.test.tsx`. 3e743fc
- [x] Task: Implement settings and accent color retrieval logic in `src/popup/Popup.tsx`. 3e743fc
- [x] Task: Conductor - User Manual Verification 'Foundation & Data Loading' (Protocol in workflow.md)

## Phase 2: UI Implementation [checkpoint: 09e8111]
- [x] Task: Implement the refined Popup UI with theme-aware containers and the "Open Settings" button. 3e743fc
- [x] Task: Apply user-selected Accent Color to the button using the `data-accent` attribute pattern. 3e743fc
- [x] Task: Update unit tests to verify theme application and button functionality. 25d2e6a
- [x] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 3: Final Integration & Polishing
- [ ] Task: Ensure `src/popup/popup.html` and `src/index.css` are correctly configured for the new layout.
- [ ] Task: Run full suite of unit tests and perform manual verification of theme switching.
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Polishing' (Protocol in workflow.md)
