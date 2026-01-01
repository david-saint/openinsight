# Specification: Extension Popup UI Alignment

## Overview
Redesign the Chrome extension popup (`src/popup/`) to align with the "Epistemic Minimalism" design philosophy established in the Options page and Content scripts. The current placeholder popup will be replaced with a refined, theme-aware interface that focuses on brand consistency and providing a clear path to settings.

## Functional Requirements
- **Branded Header:** Display the OpenInsight `Logo` and title in a style consistent with the Options page header.
- **Settings Navigation:** Provide a prominent "Open Settings" button that triggers `chrome.runtime.openOptionsPage()`.
- **Dynamic Theming:** 
    - Support Light, Dark, and System theme modes based on user settings.
    - Apply the user's selected Accent Color to the primary button.
- **Loading State:** Implement a minimal loading skeleton or indicator to be displayed while settings are fetched from `chrome.storage.local`.

## Non-Functional Requirements
- **Consistency:** Use the same Tailwind CSS patterns and components (e.g., `Logo`) as the rest of the application.
- **Performance:** Ensure the popup loads quickly; optimize storage retrieval to minimize the duration of the loading state.

## Acceptance Criteria
- [ ] The popup UI uses the project's font and color palette (Slate/Gray/White).
- [ ] The `Logo` component is rendered correctly.
- [ ] Clicking the "Open Settings" button opens the extension's options page.
- [ ] The popup correctly toggles between Light and Dark modes based on user settings.
- [ ] The "Open Settings" button background uses the user's defined Accent Color.
- [ ] A loading state is visible if settings retrieval takes more than a few milliseconds.

## Out of Scope
- Any text analysis (Explain/Fact-check) functionality within the popup.
- Search or input fields.
