# Implementation Plan: Area-Capture & Region-Selection Feature

## Phase 1: Setup Trigger Mechanisms
This phase implements the Keyboard Shortcut, Context Menu, and Popup UI trigger for the area-capture tool. They should communicate with the background script which then instructs the content script to activate the selection mode.

- [x] Task: Register commands in Manifest V3 [20a841f]
    - [x] Add `commands` array and context menu permissions to `manifest.ts`.
- [x] Task: Implement Background Script Handlers [68b4a7d]
    - [x] Write Tests: Ensure background script correctly handles keyboard shortcuts and context menu clicks by sending messages to content scripts.
    - [x] Implement: `chrome.commands.onCommand.addListener` and `chrome.contextMenus.onClicked.addListener` in `src/background/handlers.ts`.
- [x] Task: Add Popup UI Trigger [c0e6828]
    - [x] Write Tests: Ensure popup UI button triggers the area-capture by sending a message to the background or active tab content script.
    - [x] Implement: Add an `Area Capture` button to `src/popup/Popup.tsx`.
- [x] Task: Implement Content Script Listener [4149ec0]
    - [x] Write Tests: Verify the content script receives the activate-capture message and changes internal state.
    - [x] Implement: Listen for `ACTIVATE_CAPTURE` message in `src/content/content.ts`.
- [x] Task: Conductor - User Manual Verification 'Setup Trigger Mechanisms' (Protocol in workflow.md) [e917327]

## Phase 2: Selection Overlay UI
This phase implements the visual overlay for element selection and the freeform bounding box, triggered by Phase 1.

- [ ] Task: Implement Overlay Component Structure
    - [ ] Write Tests: Render a full-screen overlay component over the DOM when capture state is active.
    - [ ] Implement: Create a new React component `CaptureOverlay.tsx` injected via `src/content/mount.ts`.
- [ ] Task: Implement Element Selection (Hover & Click)
    - [ ] Write Tests: Mock `mousemove` and `click` on elements (like `<img>`, `<svg>`), ensuring a highlight box is rendered correctly.
    - [ ] Implement: DOM traversal and measurement to highlight target visual elements in `CaptureOverlay.tsx`.
- [ ] Task: Implement Freeform Bounding Box
    - [ ] Write Tests: Mock `mousedown`, `mousemove`, `mouseup` to draw and calculate the dimensions of the selected bounding box.
    - [ ] Implement: Drag-and-draw selection box logic in `CaptureOverlay.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Selection Overlay UI' (Protocol in workflow.md)

## Phase 3: Post-Capture Prompt and Display
This phase handles the prompt input and passing the captured image + prompt to the OpenInsight analysis pop-up.

- [ ] Task: Implement Prompt Input Overlay
    - [ ] Write Tests: Render a prompt input box when a region is selected.
    - [ ] Implement: Create `CapturePromptInput.tsx` that appears near the bounding box after a selection is completed.
- [ ] Task: Capture Visible Tab and Crop Image
    - [ ] Write Tests: Verify the background script calls `chrome.tabs.captureVisibleTab` and crops it to the selected dimensions.
    - [ ] Implement: Capture logic in background script and coordinate with `CaptureOverlay.tsx`.
- [ ] Task: Integrate with Existing Analysis Workflow
    - [ ] Write Tests: Verify the cropped image and user prompt are passed to the `AnalysisPopover` and `OpenRouter` API.
    - [ ] Implement: Update `AnalysisPopover.tsx` and `openrouter-service.ts` to support image payload alongside the prompt.
- [ ] Task: Conductor - User Manual Verification 'Post-Capture Prompt and Display' (Protocol in workflow.md)