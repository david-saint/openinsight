# Specification: Popover Tab Customization

## Overview
This feature allows users to customize the tabs displayed in the OpenInsight popover. Users can reorder the "Explain" and "Fact-check" tabs or disable either one of them. This provides more control over the interface, especially for users who primarily use one feature or prefer a specific tab order.

## Functional Requirements

### 1. Settings Configuration
- **Location:** The customization interface will be added to the **Options Page** under the **Appearance** section.
- **Data Structure:** Update `Settings` interface in `src/lib/settings.ts` to include:
    - `enabledTabs`: An ordered list of active tab IDs (e.g., `['explain', 'fact-check']` or `['fact-check', 'explain']`).
- **Validation:** The system must prevent the user from disabling all tabs. At least one tab must remain enabled at all times.

### 2. Options UI (Appearance Section)
- **Reordering:** Implement a Drag-and-Drop interface (or equivalent functional UI) to allow users to change the order of the tabs.
- **Visibility Toggle:** Each tab item in the list will have a toggle switch to enable or disable it.

### 3. Popover Adaptation
- **Tab Rendering:** The `AnalysisPopover` component must render tabs based on the `enabledTabs` setting.
- **Tab Bar Logic:** 
    - Only enabled tabs should be displayed in the tab bar.
    - If only one tab is enabled, the tab bar remains visible but only shows that single tab.
    - The content area must display the first tab in the `enabledTabs` array by default.

### 4. Trigger Visibility Logic
- **Condition:** The trigger button should only appear if the selected text is valid for at least one of the *enabled* tabs.
- **Edge Case:** If the "Explain" tab is disabled and the "Fact-check" tab is enabled, but the selected text is too short (e.g., < 50 chars) for fact-checking, the trigger button MUST NOT appear.

## Non-Functional Requirements
- **Persistence:** Tab preferences must be saved to `chrome.storage.local` via the existing settings mechanism.
- **Performance:** Reordering and toggling should be responsive.

## Acceptance Criteria
- [ ] Users can reorder "Explain" and "Fact-check" tabs in the Options page.
- [ ] Users can disable "Explain" or "Fact-check" (but not both).
- [ ] The popover correctly reflects the saved order and visibility settings.
- [ ] If a tab is disabled, it does not appear in the popover.
- [ ] The default view in the popover matches the first tab in the user-defined order.
- [ ] **Critical:** The trigger button does NOT appear if the only enabled tab's criteria (e.g., length > 50 chars for Fact-check) are not met by the selection.

## Out of Scope
- Adding new tab types.
- Drag-and-drop reordering directly within the popover.
