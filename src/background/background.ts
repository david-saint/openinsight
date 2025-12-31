import { onMessage } from '../lib/messaging';

console.log('OpenInsight background script initialized.');

onMessage((message, _sender, sendResponse) => {
  const { type, payload } = message;

  switch (type) {
    case 'EXPLAIN':
      console.log('Handling EXPLAIN request for:', payload.text);
      // Stub response for now
      sendResponse({
        success: true,
        result: `Stub: Explanation for "${payload.text}"`,
      });
      break;

    case 'FACT_CHECK':
      console.log('Handling FACT_CHECK request for:', payload.text);
      // Stub response for now
      sendResponse({
        success: true,
        result: `Stub: Fact check for "${payload.text}"`,
      });
      break;

    default:
      console.warn('Unknown message type:', type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // Keep message channel open for async response
});
