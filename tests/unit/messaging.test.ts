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

  it('should send an EXPLAIN message', async () => {
    chromeMock.runtime.sendMessage.mockResolvedValue({ success: true, result: 'explanation' });
    
    const response = await sendMessage('EXPLAIN', { text: 'test text' });
    
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'EXPLAIN',
      payload: { text: 'test text' },
    });
    expect(response).toEqual({ success: true, result: 'explanation' });
  });

  it('should send a FACT_CHECK message', async () => {
    chromeMock.runtime.sendMessage.mockResolvedValue({ success: true, result: 'fact check' });
    
    const response = await sendMessage('FACT_CHECK', { text: 'another text' });
    
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'FACT_CHECK',
      payload: { text: 'another text' },
    });
    expect(response).toEqual({ success: true, result: 'fact check' });
  });

  it('should register a listener for messages', () => {
    const handler = vi.fn();
    onMessage(handler);
    
    expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalled();
  });
});
