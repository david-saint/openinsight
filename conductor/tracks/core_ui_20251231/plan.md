# Implementation Plan - Core UI (Epistemic Minimalism)

This plan outlines the steps to implement the core user interface of OpenInsight, focusing on the in-page trigger, analysis modal, and a comprehensive options page, all adhering to the "Epistemic Minimalism" design philosophy.

## Phase 1: Foundation & Asset Integration [checkpoint: 6dceb4d]

Establish the basic extension structure, update branding, create the settings module, and prepare the storage layer.

- [x] Task: Update Extension Icons and Manifest [66fea0c]
- [x] Task: TDD - Design and Implement Settings Module (`src/lib/settings.ts`) [b891c83]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md) [6dceb4d]

## Phase 2: Full Options Page Implementation [checkpoint: 1497a19]

Create the dedicated options page where users can manage all extension configurations.

- [x] Task: TDD - Options Page Layout with Tailwind (Stark whites/Inky blacks theme) [1ca2244]
- [x] Task: TDD - API Key Input Component with secure storage via `encryption.ts` [5564b47]
- [x] Task: TDD - Model Selection Dropdowns for Explain and Fact-Check models [a4e9371]
- [x] Task: TDD - Theme Mode Toggle (Light/Dark) with persistence [dddda5d]
- [x] Task: TDD - Accent Color Selector (Teal, Indigo, Rose, Amber) [b65593d]
- [x] Task: TDD - Trigger Mode Toggle (Icon vs. Immediate) [3990bda]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Options Page' (Protocol in workflow.md) [1497a19]

## Phase 3: Content Script - Floating Trigger & Shadow DOM [verified]

Implement the selection-based trigger mechanism, isolated from the host page's CSS.

- [x] Task: Configure Tailwind CSS for Shadow DOM Injection [b282e05]
- [x] Task: TDD - Shadow DOM Container Setup in content script with React mounting [90179a1]
- [x] Task: TDD - Text Selection Listener with `mouseup` event handling
- [x] Task: TDD - Trigger Button Positioning Logic relative to selection bounds
- [x] Task: TDD - Floating Trigger Component with Lucide Sparkles icon
- [x] Task: Conductor - User Manual Verification 'Phase 3: Floating Trigger' (Protocol in workflow.md) [verified]

## Phase 4: Refactoring - Dynamic Theming with CSS Variables [checkpoint: 05a0c00]

Migrate from JavaScript-based dynamic classes to CSS variables for theming to ensure cleaner code and better Shadow DOM support.

- [x] Task: TDD - Define CSS variable structure for themes (primary, surface, text) in `index.css` [05a0c00]
- [x] Task: TDD - Update Tailwind config to use CSS variables for colors [05a0c00]
- [x] Task: TDD - Refactor `Options.tsx` to use semantic classes instead of dynamic color props [05a0c00]
- [x] Task: TDD - Ensure CSS variables are injected into Shadow DOM container [05a0c00]
- [x] Task: Conductor - User Manual Verification 'Phase 4: Theming' (Protocol in workflow.md) [05a0c00]

## Phase 5: Content Script - Analysis Modal [checkpoint: 235b1cb]

Implement the main interaction surface for explaining and fact-checking text.

- [x] Task: TDD - Modal Container with Shadow DOM isolation and positioning [235b1cb]
- [x] Task: TDD - Modal Header with Tabs (Explain/Fact Check) and Close button [235b1cb]
- [x] Task: TDD - Tab Switching Logic with loading state transitions [235b1cb]
- [x] Task: TDD - Explain View with contextual analysis placeholder content [235b1cb]
- [x] Task: TDD - Fact Check View with verification badge and source display [235b1cb]
- [x] Task: TDD - Quick Settings View with hardcoded fields (Theme, Accent, Trigger Mode) [235b1cb]
- [x] Task: TDD - "Open Full Settings" button that opens `options.html` [235b1cb]
- [x] Task: TDD - Modal Responsive Behavior to keep within viewport bounds [235b1cb]
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Analysis Modal' (Protocol in workflow.md)

## Phase 5.5: Refactoring - Popover & Optimization

Refactor the Analysis Modal into a lightweight Popover and optimize the content script bundle size.

- [x] Task: TDD - Refactor AnalysisModal to AnalysisPopover (relative positioning, click-outside to close)
- [x] Task: Optimize - Implement dynamic import/code-splitting for ContentApp to reduce initial bundle size
- [ ] Task: Conductor - User Manual Verification 'Phase 5.5: Popover' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'Phase 5.5: Popover' (Protocol in workflow.md)

## Phase 6: Polishing & Minimalism Alignment

Refine the UI to strictly follow the "Epistemic Minimalism" philosophy and ensure consistency.

- [ ] Task: Style Review against `proof-of-concept.md` for Teal accents, typography, and spacing
- [ ] Task: Implement Dark Mode Sync across Shadow DOM container and Options page
- [ ] Task: E2E Test - Trigger button appears on text selection
- [ ] Task: E2E Test - Modal opens on trigger click with Explain tab active
- [ ] Task: E2E Test - Tab switching between Explain and Fact Check views
- [ ] Task: E2E Test - Quick Settings toggle and theme change application
- [ ] Task: E2E Test - "Open Full Settings" navigates to options page
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Polishing' (Protocol in workflow.md)