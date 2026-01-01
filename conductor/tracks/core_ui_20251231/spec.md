# Specification: Core UI Implementation (Epistemic Minimalism)

## 1. Overview

This track focuses on implementing the core user interface for the OpenInsight Chrome extension, adhering to the "Epistemic Minimalism" design philosophy. The implementation uses the provided `proof-of-concept.md` as a visual and functional guide but adapts the architecture to a Chrome Extension context. The UI includes an in-page floating trigger button that opens an in-page modal for content analysis ("Explain" and "Fact Check"). It also establishes a dedicated Options page for comprehensive settings, with a subset of "quick settings" available in the modal.

## 2. Functional Requirements

### 2.1. In-Page Trigger (Floating Button)

- **Trigger:** Appears automatically when a user highlights text on a webpage.
- **Position:** dynamically positioned near the end of the text selection.
- **Appearance:** Stylized "spark" icon (Lucide `Sparkles`).
- **Action:** Clicking the button opens the Analysis Modal.
- **Behavior:** Disappears if the selection is cleared or the modal is opened.

### 2.2. Analysis Modal (In-Page)

- **Type:** In-page modal (injected via Shadow DOM to isolate styles).
- **Views:**
  - **Main View:**
    - **Tabs:** Toggle between "Explain" (default) and "Fact Check".
    - **Content Area:** Displays the result of the analysis (mocked or placeholder for this track if backend not ready, but UI must support it).
    - **Loading State:** distinct visual state while "analyzing".
  - **Quick Settings View:** Access limited user-selected settings (see 2.3).
- **Header:**
  - Navigation (Back button if in settings).
  - Close button.
  - Settings button (gears icon) to toggle Quick Settings view.

### 2.3. Settings & Configuration

- **Dedicated Options Page:**
  - Full configuration interface (React-based).
  - Fields: OpenRouter API Key management, Model selection (Explain/Fact-check), Theme selection, Trigger mode.
  - **Feature:** "Quick Settings Configuration" - User can select up to 2-3 specific settings to be exposed in the Modal's Quick Settings view.
- **Quick Settings (in Modal):**
  - **V1 (This Track):** Displays a hardcoded set of settings: Theme Mode, Accent Color, and Trigger Mode.
  - **Future Track:** The ability for users to select which 2-3 options appear here via the full Options page will be implemented in a subsequent track.
  - Includes a link/button to "Open Full Settings".

### 2.4. Design & Branding (Epistemic Minimalism)

- **Theme:** Stark whites, deep ink blacks.
- **Typography:** Sans-serif for UI elements; Serif for content/reading contexts (if applicable).
- **Dark Mode:** Fully supported, toggleable (persisted preference).
- **Color Themes:** Support for "Teal", "Indigo", "Rose", "Amber" accents.
- **Assets:** Use `assets/logos/logo-transparent.png` for extension branding. Use Lucide-react for icons.

## 3. Technical Constraints & Architecture

- **Frontend Framework:** React (as per tech stack).
- **Styling:** Tailwind CSS (utility-first).
- **Isolation:** All in-page elements (Trigger, Modal) MUST be encapsulated in a Shadow DOM to prevent CSS bleeding from/to the host page.
- **State Management:** React Context or local state for UI state; `chrome.storage.local` for persisting settings.

## 4. Assets

- **Logos:** `assets/logos/`
- **Icons:** Lucide React
- **Reference Code:** `proof-of-concept.md` (React logic and Tailwind classes).

## 5. Out of Scope

- Actual integration with OpenRouter API (this track focuses on UI construction and flow; data fetching can be mocked).
- Complex text analysis logic (placeholder text is acceptable for UI verification).
