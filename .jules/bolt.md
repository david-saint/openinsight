## 2024-05-23 - Content Script Performance
**Learning:** Browser extension content scripts can accidentally create performance bottlenecks by attaching un-debounced event listeners to `document`. Specifically, `mouseup` can fire frequently or in bursts (e.g., drag selections).
**Action:** Always debounce global event listeners in content scripts, especially those that trigger layout calculations (like `getBoundingClientRect` or `getSelection`). Using `useRef` for timeout management in React functional components ensures state persistence across renders without triggering re-renders.

## 2024-05-24 - React Component Conditional Rendering
**Learning:** Returning `null` from a React component does not prevent its hooks (useState, useEffect, custom hooks) from executing. In a high-frequency interaction path (like text selection in a content script), rendering a hidden component can still cause significant overhead.
**Action:** Use conditional rendering (`{isOpen && <Component />}`) instead of internal early returns (`if (!isOpen) return null`) for complex components (like popovers or modals) that are often hidden, to ensure they consume zero resources when not needed.
