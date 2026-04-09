# Specification: Area-Capture & Region-Selection Feature

## 1. Overview
Introduce an area-capture tool allowing users to select a region of the screen (e.g., charts, graphs, images) to ask targeted questions and receive contextual explanations. The feature integrates with the existing epistemic minimalism philosophy by extending the pop-up behavior to visual elements.

## 2. Functional Requirements
### 2.1 Trigger Mechanisms
The user can initiate the area-capture tool via three experimental methods. These methods must be modular and easy to toggle/remove based on future usability testing:
- **Keyboard Shortcut:** A configurable shortcut (e.g., Cmd/Ctrl+Shift+X or similar mapping in Manifest).
- **Context Menu:** A right-click option on the page context menu.
- **Popup UI:** A dedicated trigger button within the extension's popup (`src/popup`).

### 2.2 Selection UI
When triggered, an overlay is presented to the user supporting two selection modes:
- **Element Selection:** Auto-detects and highlights specific DOM elements (images, SVGs, canvas, charts) on hover for a single-click selection.
- **Freeform Bounding Box:** Allows the user to click and drag to draw a custom rectangular region.

### 2.3 Post-Capture Workflow
- **Prompt Input:** Immediately after capturing a region or selecting an element, the user is prompted to specify a question or topic of focus via a minimalist input overlay.
- **Analysis Display:** The extension captures the visual region (using `chrome.tabs.captureVisibleTab` or similar) and specific element data.
- **Result Output:** The standard "Explain" pop-up appears near the selected region, displaying the LLM's explanation based on the captured image/context and the user's specific prompt.

## 3. Non-Functional Requirements
- **Performance:** The selection overlay must feel native, with zero noticeable lag when highlighting elements or dragging the bounding box.
- **Modularity:** Trigger mechanisms must be decoupled from the core selection logic to easily remove unused triggers post-experimentation.
- **Visual Design:** The selection overlay and prompt input must align with the "epistemic minimalism" theme of OpenInsight.

## 4. Acceptance Criteria
- [ ] Keyboard shortcut activates the selection overlay.
- [ ] Context menu option activates the selection overlay.
- [ ] Popup button activates the selection overlay.
- [ ] Users can click and drag to define a freeform capture box.
- [ ] Users can hover over and click an image/SVG/canvas to select it instantly.
- [ ] After selection, an input field appears for the user to ask a specific question.
- [ ] The captured image and user prompt are sent to the backend/OpenRouter.
- [ ] The standard OpenInsight pop-up displays the generated explanation.

## 5. Out of Scope
- Native OCR text extraction (defer to LLM Vision capabilities if needed).
- Persistent chat sidebar (reusing existing standard pop-up instead).