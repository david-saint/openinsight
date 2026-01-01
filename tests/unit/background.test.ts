import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as handlers from '../../src/background/handlers';

// Mock chrome.runtime
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    openOptionsPage: vi.fn(),
  },
};

vi.stubGlobal('chrome', chromeMock);

vi.mock('../../src/background/handlers', () => ({
  handleExplain: vi.fn(),
  handleFactCheck: vi.fn(),
  handleTestApiKey: vi.fn(),
  handleFetchModels: vi.fn(),
}));

describe('Background Script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should register a message listener', async () => {
    await import('../../src/background/background?t=' + Date.now());
    expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  it('should route EXPLAIN message to handleExplain', async () => {
    vi.mocked(handlers.handleExplain).mockResolvedValue('explanation result');
    await import('../../src/background/background?t=' + Date.now());
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    const sendResponse = vi.fn();
    listener({ type: 'BACKEND_EXPLAIN', payload: { text: 'test' } }, {}, sendResponse);
    
    // Need to wait for the async handler inside the listener
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(handlers.handleExplain).toHaveBeenCalledWith('test');
    expect(sendResponse).toHaveBeenCalledWith({
      success: true,
      result: 'explanation result',
    });
  });

  it('should handle errors from handlers', async () => {
    const appError = { type: 'auth', message: 'Unauthorized' };
    vi.mocked(handlers.handleExplain).mockRejectedValue(appError);
    await import('../../src/background/background?t=' + Date.now());
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    const sendResponse = vi.fn();
    listener({ type: 'BACKEND_EXPLAIN', payload: { text: 'test' } }, {}, sendResponse);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(sendResponse).toHaveBeenCalledWith({
      success: false,
      error: appError,
    });
  });

  it('should respond to OPEN_OPTIONS message', async () => {
    await import('../../src/background/background?t=' + (Date.now() + 1));
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    const sendResponse = vi.fn();
    listener({ type: 'OPEN_OPTIONS' }, {}, sendResponse);
    
    expect(chromeMock.runtime.openOptionsPage).toHaveBeenCalled();
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });
});
