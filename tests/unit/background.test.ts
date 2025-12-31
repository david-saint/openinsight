import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onMessage } from '../../src/lib/messaging';

// Mock chrome.runtime
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('Background Script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should register a message listener', async () => {
    await import('../../src/background/background?t=' + Date.now());
    expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  it('should respond to EXPLAIN message', async () => {
    await import('../../src/background/background?t=' + Date.now());
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    const sendResponse = vi.fn();
    const result = listener({ type: 'EXPLAIN', payload: { text: 'test' } }, {}, sendResponse);
    
    expect(result).toBe(true); // Should return true for async response
    expect(sendResponse).toHaveBeenCalledWith({
      success: true,
      result: 'Stub: Explanation for "test"',
    });
  });

  it('should respond to FACT_CHECK message', async () => {
    await import('../../src/background/background?t=' + (Date.now() + 1));
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    const sendResponse = vi.fn();
    const result = listener({ type: 'FACT_CHECK', payload: { text: 'test' } }, {}, sendResponse);
    
    expect(result).toBe(true);
    expect(sendResponse).toHaveBeenCalledWith({
      success: true,
      result: 'Stub: Fact check for "test"',
    });
  });
});
