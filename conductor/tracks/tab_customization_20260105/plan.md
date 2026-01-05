# Plan: Popover Tab Customization

## Phase 1: Core Settings & State Management [checkpoint: b03dce0]
- [x] Task: Update `Settings` interface and defaults in `src/lib/settings.ts` de71a45
    - [ ] Add `enabledTabs` (string array) to `Settings`.
    - [ ] Update `DEFAULT_SETTINGS` to `enabledTabs: ['explain', 'fact-check']`.
    - [ ] Ensure backward compatibility (migration if needed, though simple default should suffice).
- [x] Task: Test Settings Updates (TDD) c0ed59f
    - [ ] Create/Update `tests/unit/settings.test.ts` to verify `enabledTabs` persistence and default values.
    - [ ] Verify validation logic (ensure at least one tab is always present) - *Note: Logic might be in UI handler or settings setter.*
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Settings' (Protocol in workflow.md)

## Phase 2: Options UI Implementation [checkpoint: 10476a6]
- [x] Task: Create `TabReorderList` component 4b59669
    - [ ] Create `src/options/components/TabReorderList.tsx`.
    - [ ] Implement list rendering based on `enabledTabs`.
    - [ ] Implement drag-and-drop reordering or high-quality manual reorder buttons.
    - [ ] Implement toggle switches for visibility.
    - [ ] **Validation:** Prevent disabling the last active tab.
- [x] Task: Integrate into `AppearanceSection` 51fd467
    - [ ] Update `src/options/components/AppearanceSection.tsx` to include `TabReorderList`.
    - [ ] Connect to `useSettings` hook or equivalent state management.
- [x] Task: Test Options UI (TDD) 51fd467
    - [ ] Create `tests/unit/tab_reorder_list.test.tsx`.
    - [ ] Test reordering logic.
    - [ ] Test disabling/enabling logic (and the "must have one" constraint).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Options UI' (Protocol in workflow.md)

## Phase 3: Content Script & Trigger Logic Updates [checkpoint: eaf3fe4]
- [x] Task: Update Trigger Logic in `src/content/selection.ts` (or relevant handler) c1dd804
    - [ ] Read `enabledTabs` from settings.
    - [ ] Modify the logic that decides whether to show the trigger button.
    - [ ] **Logic:** `showTrigger = (enabledTabs.includes('explain') && validForExplain) || (enabledTabs.includes('fact-check') && validForFactCheck)`.
- [x] Task: Test Trigger Logic (TDD) c1dd804
    - [ ] Update `tests/unit/selection.test.ts`.
    - [ ] Case: Explain disabled, Short text -> No Trigger.
    - [ ] Case: Explain enabled, Short text -> Trigger.
    - [ ] Case: Fact-check disabled, Long text -> Trigger (if Explain enabled).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Trigger Logic' (Protocol in workflow.md)

## Phase 4: Popover UI Updates
- [x] Task: Update `AnalysisPopover` and Header da7359d
    - [ ] Update `src/content/components/analysis-popover/AnalysisHeader.tsx` to render tabs based on `enabledTabs`.
    - [ ] Ensure the first tab in `enabledTabs` is active by default when opening.
    - [ ] Handle switching logic (only switch to enabled tabs).
- [x] Task: Test Popover UI (TDD) da7359d
    - [ ] Update `tests/unit/analysis_popover.test.tsx`.
    - [ ] Verify tab rendering order matches settings.
    - [ ] Verify hidden tabs are not DOM-present or are visually hidden.
    - [ ] Verify default active tab.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Popover UI' (Protocol in workflow.md)

## Phase 5: Verification
- [ ] Task: Conductor - User Manual Verification 'End-to-End Verification' (Protocol in workflow.md)
