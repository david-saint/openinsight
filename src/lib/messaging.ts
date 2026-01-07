import type { BackendMessage, BackendMessageType, BackendResponse } from "./types.js";

export type MessageType = BackendMessageType | "OPEN_OPTIONS";

export interface Message<T extends MessageType = MessageType> {
  type: T;
  payload?: any;
}

// Re-export Response type for compatibility, but ideally we use BackendResponse
export type Response = BackendResponse<any>;

export async function sendMessage<T extends MessageType>(
  type: T,
  payload?: any
): Promise<Response> {
  try {
    const response = await chrome.runtime.sendMessage({ type, payload });
    return response as Response;
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'unknown',
        message: error instanceof Error ? error.message : String(error)
      },
    };
  }
}

export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response) => void
  ) => void | boolean
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Cast the incoming message to our known structure
    return handler(message as Message, sender, sendResponse);
  });
}