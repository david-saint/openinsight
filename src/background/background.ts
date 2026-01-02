import { onMessage } from "../lib/messaging";
import { 
  handleExplain, 
  handleFactCheck, 
  handleFetchModels, 
  handleTestApiKey 
} from "./handlers";

console.log("OpenInsight background script initialized.");

onMessage((message, _sender, sendResponse) => {
  const { type, payload } = message;
  console.log("Background received message:", type);

  // Use a helper for async responses
  const handleAsync = async (fn: () => Promise<any>) => {
    try {
      const result = await fn();
      sendResponse({ success: true, result });
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
      sendResponse({ success: false, error });
    }
  };

  switch (type) {
    case "BACKEND_EXPLAIN":
      handleAsync(() => handleExplain(payload.text));
      break;

    case "BACKEND_FACT_CHECK":
      handleAsync(() => handleFactCheck(payload));
      break;

    case "BACKEND_TEST_KEY":
      handleAsync(() => handleTestApiKey(payload.apiKey));
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
      console.warn("Unknown message type:", type);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true; // Keep message channel open for async response
});