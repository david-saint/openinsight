# Architectural Roadmap

This document outlines the planned structural improvements for the OpenInsight codebase to ensure scalability and maintainability.

## 1. Modular Message Routing
- **Current State:** `src/background/background.ts` uses a large switch-case block within `onMessage`.
- **Target:** Implement a router pattern where handlers are registered for specific message types.
- **Benefit:** Decentralizes logic, makes `background.ts` a simple entry point, and improves testability of individual handlers.

## 2. State Management Strategy
- **Current State:** Components in the Options and Popup pages fetch settings directly from storage on mount.
- **Target:** Integrate a lightweight state management library (e.g., Zustand) or a shared React Context/Hook pattern.
- **Benefit:** Ensures UI consistency across different views and simplifies complex state transitions (like theme switching or tab reordering).

## 3. Technical Debt & Cleanup
- **Legacy Migration:** Remove the "Legacy Support" logic in `src/background/background.ts` once the transition to the current manifest/storage version is verified in the user base.
- **Error Handling:** Standardize the error propagation from the `OpenRouterService` through the messaging layer to ensure consistent UI feedback for rate limits, API failures, and network issues.

## 4. Structured Output Validation
- **Target:** Ensure all LLM responses are strictly validated against their respective Zod/JSON schemas before reaching the UI components to prevent rendering crashes from malformed model output.
