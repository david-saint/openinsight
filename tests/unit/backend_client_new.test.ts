import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackendClient } from '../../src/lib/backend-client';
import { ExplainResponse, FactCheckResponse } from '../../src/lib/types';

// Mock chrome.runtime
const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('BackendClient - New Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have explainText method that returns ExplainResponse', async () => {
    const mockResponse: ExplainResponse = {
      summary: 'Summary',
      explanation: 'Explanation'
    };
    
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

  it('should have factCheckText method that returns FactCheckResponse', async () => {
    const mockResponse: FactCheckResponse = {
      summary: 'Summary',
      verdict: 'True',
      details: 'Details'
    };

    const mockPayload = {
      text: 'test text',
      context: {
        paragraph: 'Full paragraph',
        pageTitle: 'Page Title',
        pageDescription: 'Page Description'
      }
    };
    
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, callback) => {
      callback({ success: true, result: mockResponse });
    });

    const result = await BackendClient.factCheckText(mockPayload.text, mockPayload.context);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'BACKEND_FACT_CHECK', payload: mockPayload },
      expect.any(Function)
    );
    expect(result).toEqual(mockResponse);
  });
});
