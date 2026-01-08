# Feature Suggestions & Enhancements

This document outlines potential features and security enhancements to align with OpenInsight's goal of "epistemic minimalism" and improved user experience.

## New Feature Opportunities

### 1. Smart Caching
- **Description:** Implement a local cache (using `chrome.storage.local` or IndexedDB) keyed by a hash of the selected text and the model identifier.
- **Benefit:** Reduces API latency for repeated queries, saves OpenRouter tokens, and allows offline viewing of previous insights.

### 2. Insight History ("The Journal")
- **Description:** A dedicated view in the Options page or a sidebar that logs previous explanations and fact-checks.
- **Benefit:** Allows users to build a personal knowledge base and revisit complex topics.

### 3. "Devil's Advocate" Mode
- **Description:** A toggleable mode that prompts the LLM to specifically look for counter-perspectives, potential biases, or missing context in the selected text.
- **Benefit:** Deepens the "epistemic" value by preventing confirmation bias.

### 4. Confidence Scores & Source Metrics
- **Description:** Extract and visualize confidence levels from the LLM. If supported by the model, include a "Source Diversity" metric.
- **Benefit:** Provides transparency into the reliability of the generated content.

## Security Enhancements

### 1. Hardened API Key Storage
- **Current State:** Uses AES-GCM with a hardcoded `OBFUSCATION_KEY`.
- **Suggestion:** 
  - Move to `chrome.storage.session` for keys that should not persist across browser sessions.
  - Or, allow users to set an optional "Master Password" to derive the encryption key, ensuring the API key is never readable by just inspecting the extension source.
