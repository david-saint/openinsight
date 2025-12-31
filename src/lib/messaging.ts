export type MessageType = 'EXPLAIN' | 'FACT_CHECK';

export interface MessagePayload {
  text: string;
}

export interface Message<T extends MessageType> {
  type: T;
  payload: MessagePayload;
}

export interface Response {
  success: boolean;
  result?: string;
  error?: string;
}

export async function sendMessage<T extends MessageType>(
  type: T,
  payload: MessagePayload
): Promise<Response> {
  try {
    const response = await chrome.runtime.sendMessage({ type, payload });
    return response as Response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function onMessage(
  handler: (
    message: Message<MessageType>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response) => void
  ) => void | boolean
) {
  chrome.runtime.onMessage.addListener(handler);
}
