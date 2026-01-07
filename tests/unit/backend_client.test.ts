import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackendClient } from '../../src/lib/backend-client';

// Mock chrome.runtime
const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('BackendClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call BACKEND_EXPLAIN', async () => {
    const mockResponse = { summary: 'summary', explanation: 'explanation' };
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: true, result: mockResponse });
    });

    const result = await BackendClient.explainText('test text');

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'BACKEND_EXPLAIN', payload: { text: 'test text' } },
      expect.any(Function)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call BACKEND_FACT_CHECK', async () => {
    const mockResponse = { summary: 'summary', verdict: 'True', details: 'details' };
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: true, result: mockResponse });
    });

    const mockContext = {
      paragraph: 'p',
      pageTitle: 't',
      pageDescription: 'd'
    };

    const result = await BackendClient.factCheckText('test text', mockContext);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { 
        type: 'BACKEND_FACT_CHECK', 
        payload: { text: 'test text', context: mockContext } 
      },
      expect.any(Function)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call BACKEND_FETCH_MODELS', async () => {
    const mockModels = [{ id: 'm1', name: 'M1' }];
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: true, result: mockModels });
    });

    const result = await BackendClient.fetchModels();

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'BACKEND_FETCH_MODELS' },
      expect.any(Function)
    );
    expect(result).toEqual(mockModels);
  });

  it('should call BACKEND_TEST_KEY', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: true, result: true });
    });

    const result = await BackendClient.testApiKey('test-key');

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'BACKEND_TEST_KEY', payload: { apiKey: 'test-key' } },
      expect.any(Function)
    );
    expect(result).toBe(true);
  });

  it('should throw AppError if response success is false', async () => {
    const mockError = { type: 'auth', message: 'Unauthorized' };
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: false, error: mockError });
    });

    await expect(BackendClient.explainText('test')).rejects.toEqual(mockError);
  });
});