import type { BackendResponse, MessageSchema, MessageType } from "./types.js";

// Export Message interface so consumers can use it (e.g. in background.ts)
export type Message = {
  [K in MessageType]: { type: K; payload: MessageSchema[K]["payload"] };
}[MessageType];

// Helper to get the response type for a given message type
export type Response<T extends MessageType> = BackendResponse<
  MessageSchema[T]["response"]
>;

export async function sendMessage<T extends MessageType>(
  type: T,
  payload: MessageSchema[T]["payload"]
): Promise<MessageSchema[T]["response"]> {
  try {
    const response = await chrome.runtime.sendMessage({ type, payload });

    // Check for runtime errors first
    if (chrome.runtime.lastError) {
      throw {
        type: "unknown",
        message: chrome.runtime.lastError.message || "Extension runtime error",
      };
    }

    if (!response.success) {
      // Re-throw the structured AppError from the backend
      throw (
        response.error || { type: "unknown", message: "Unknown error occurred" }
      );
    }

    return response.result;
  } catch (error: any) {
    if (error.type) throw error;
    throw {
      type: "unknown",
      message: error.message || String(error),
    };
  }
}

export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: BackendResponse<any>) => void
  ) => void | boolean
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return handler(message as Message, sender, sendResponse);
  });
}
