import { onMessage } from "../lib/messaging.js";
import {
  handleExplain,
  handleFactCheck,
  handleFetchModels,
  handleTestApiKey,
} from "./handlers.js";

console.log("OpenInsight background script initialized.");

onMessage((message, _sender, sendResponse) => {
  console.log("Background received message:", message.type);

  // Use a helper for async responses
  const handleAsync = async (fn: () => Promise<any>) => {
    try {
      const result = await fn();
      sendResponse({ success: true, result });
    } catch (error: any) {
      console.error(`Error handling ${message.type}:`, error);
      // Ensure we always send a structured error object
      const appError = error?.type
        ? error
        : {
            type: "unknown",
            message: error?.message || String(error),
          };
      sendResponse({ success: false, error: appError });
    }
  };

  // Re-writing the whole switch block to use message.type
  switch (message.type) {
    case "BACKEND_EXPLAIN":
      handleAsync(() =>
        handleExplain(message.payload.text, message.payload.emphasizedWords)
      );
      break;

    case "BACKEND_FACT_CHECK":
      handleAsync(() => handleFactCheck(message.payload));
      break;

    case "BACKEND_TEST_KEY":
      handleAsync(() => handleTestApiKey(message.payload.apiKey));
      break;

    case "BACKEND_FETCH_MODELS":
      handleAsync(() => handleFetchModels());
      break;

    case "OPEN_OPTIONS":
      console.log("Handling OPEN_OPTIONS request");
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      break;

    default:
      // message.type is never here if exhaustive, but type at runtime can be anything.
      console.warn("Unknown message type:", (message as any).type);
      sendResponse({
        success: false,
        error: { type: "unknown", message: "Unknown message type" },
      });
  }

  return true; // Keep message channel open for async response
});
