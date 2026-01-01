## 2024-05-23 - Content Script Performance
**Learning:** Browser extension content scripts can accidentally create performance bottlenecks by attaching un-debounced event listeners to `document`. Specifically, `mouseup` can fire frequently or in bursts (e.g., drag selections).
**Action:** Always debounce global event listeners in content scripts, especially those that trigger layout calculations (like `getBoundingClientRect` or `getSelection`). Using `useRef` for timeout management in React functional components ensures state persistence across renders without triggering re-renders.
