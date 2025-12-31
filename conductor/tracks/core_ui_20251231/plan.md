# Implementation Plan - Core UI (Epistemic Minimalism)

This plan outlines the steps to implement the core user interface of OpenInsight, focusing on the in-page trigger, analysis modal, and a comprehensive options page, all adhering to the "Epistemic Minimalism" design philosophy.

## Phase 1: Foundation & Asset Integration

Establish the basic extension structure, update branding, create the settings module, and prepare the storage layer for user settings.

- [x] Task: Update Extension Icons and Manifest [66fea0c]
  - Replace default icons in `public/` (if any) or update `manifest.ts` to point to `assets/logos/logo-transparent.png`.
  - Ensure all necessary permissions (`storage`, `activeTab`) are present in `manifest.ts`.
- [ ] Task: TDD - Design and Implement Settings Module (`src/lib/settings.ts`)
  - Define the `Settings` interface with all user-configurable options (theme, accentColor, apiKey, explainModel, factCheckModel, triggerMode).
  - Implement `getSettings()` and `saveSettings()` functions that use the generic `storage.ts` helpers.
  - Implement `getApiKey()` and `saveApiKey()` functions that use the encrypted storage helpers.
  - Write unit tests for the settings module, mocking `chrome.storage.local`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md)

## Phase 2: Full Options Page Implementation

Create the dedicated options page where users can manage all extension configurations.

- [ ] Task: TDD - Options Page Layout & Basic Routing
  - Write tests for the Options page container.
  - Implement the base layout using Tailwind (Stark whites/Inky blacks).
- [ ] Task: TDD - API Key & Model Configuration
  - Write tests for secure API key input (using `encryption.ts`) and model selection dropdowns.
  - Implement the settings sections for OpenRouter and Model preferences.
- [ ] Task: TDD - Theme & Appearance Settings
  - Write tests for theme mode (light/dark) switching and accent color selection.
  - Implement the appearance settings UI components.
- [ ] Task: TDD - Trigger Mode Setting
  - Write tests for the trigger mode toggle (Icon vs. Immediate).
  - Implement the behavior settings section.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Options Page' (Protocol in workflow.md)

## Phase 3: Content Script - Floating Trigger & Shadow DOM

Implement the selection-based trigger mechanism, isolated from the host page's CSS. This phase includes critical Tailwind configuration for Shadow DOM.

- [ ] Task: Configure Tailwind CSS for Shadow DOM Injection
  - Update Tailwind/Vite configuration to build an injectable stylesheet for the content script's Shadow DOM.
  - Use `constructable stylesheets` or a bundled CSS string approach to adopt styles inside the shadow root.
  - Document the chosen approach in this plan or in a code comment.
- [ ] Task: TDD - Shadow DOM Container Setup
  - Write tests to verify the creation and isolation of the Shadow DOM container in the content script.
  - Implement the `ContentApp` mounting logic with Shadow DOM and injected Tailwind styles.
- [ ] Task: TDD - Text Selection & Positioning Logic
  - Write tests for the selection listener and the calculation of coordinates for the trigger button.
  - Implement the `mouseup` listener and position state management.
- [ ] Task: TDD - Floating Trigger Component
  - Write tests for the "Spark" trigger button visibility and click handling.
  - Implement the trigger button using Lucide icons and PoC styling.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Floating Trigger' (Protocol in workflow.md)

## Phase 4: Content Script - Analysis Modal

Implement the main interaction surface for explaining and fact-checking text.

- [ ] Task: TDD - Modal Structure & Tab Navigation
  - Write tests for the Modal's presence and switching between "Explain" and "Fact Check" tabs.
  - Implement the modal layout, tabs, and header based on the PoC.
- [ ] Task: TDD - Content Views & Loading States
  - Write tests for the content area rendering and loading spinners.
  - Implement the "Explain" and "Fact Check" result views (with mocked data/placeholders).
- [ ] Task: TDD - Quick Settings View (Modal) - Hardcoded Fields
  - Write tests for the Quick Settings toggle and its content.
  - **V1 Scope:** Implement the Quick Settings view with a hardcoded list of fields: Theme Mode, Accent Color, and Trigger Mode.
  - Include a link/button to "Open Full Settings" (opens `options.html`).
  - **Deferred:** Full "Quick Settings Configuration" (allowing users to choose which settings appear here) is out of scope for this track and will be addressed in a future track.
- [ ] Task: TDD - Modal Responsive Behavior
  - Write tests to ensure the modal handles various viewport sizes correctly (e.g., doesn't overflow on narrow screens).
  - Implement defensive positioning logic to keep the modal within the visible viewport.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Analysis Modal' (Protocol in workflow.md)

## Phase 5: Polishing & Minimalism Alignment

Refine the UI to strictly follow the "Epistemic Minimalism" philosophy and ensure cross-page consistency.

- [ ] Task: Refine "Epistemic Minimalism" Styles
  - Review all components against `proof-of-concept.md` to ensure correct usage of Teal accents, typography, and spacing.
- [ ] Task: Implement/Verify Dark Mode Sync
  - Ensure the `dark` class is correctly applied to the Shadow DOM container and Options page based on user settings.
- [ ] Task: Final Integration & E2E Verification (Playwright)
  - **Setup:** Configure Playwright to load the built extension in a Chromium browser context.
  - **Test Case 1:** Navigate to a test HTML page, highlight text, verify the trigger button appears.
  - **Test Case 2:** Click the trigger, verify the modal opens with "Explain" tab active.
  - **Test Case 3:** Switch to "Fact Check" tab, verify loading state and content view.
  - **Test Case 4:** Open Quick Settings via the gear icon, toggle theme, verify changes apply.
  - **Test Case 5:** Click "Open Full Settings", verify the `options.html` page opens correctly.
  - Run the full suite of E2E tests to ensure the flow from selection -> trigger -> modal -> settings works seamlessly.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Polishing' (Protocol in workflow.md)
