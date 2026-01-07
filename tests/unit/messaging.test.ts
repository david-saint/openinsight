import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage, onMessage } from '../../src/lib/messaging';

// Mock chrome.runtime
const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('Messaging Bus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a BACKEND_EXPLAIN message', async () => {
    chromeMock.runtime.sendMessage.mockResolvedValue({ success: true, result: { summary: 'explanation', explanation: 'details' } });
    
    const response = await sendMessage('BACKEND_EXPLAIN', { text: 'test text' });
    
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'BACKEND_EXPLAIN',
      payload: { text: 'test text' },
    });
    expect(response).toEqual({ success: true, result: { summary: 'explanation', explanation: 'details' } });
  });

  it('should send a BACKEND_FACT_CHECK message', async () => {
    chromeMock.runtime.sendMessage.mockResolvedValue({ success: true, result: { summary: 'fact check', verdict: 'True' } });
    
    const response = await sendMessage('BACKEND_FACT_CHECK', { text: 'another text' });
    
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'BACKEND_FACT_CHECK',
      payload: { text: 'another text' },
    });
    expect(response).toEqual({ success: true, result: { summary: 'fact check', verdict: 'True' } });
  });

  it('should register a listener for messages', () => {
    const handler = vi.fn();
    onMessage(handler);
    
    expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalled();
  });
});