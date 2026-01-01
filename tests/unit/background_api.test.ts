import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from '../../src/background/api';
import * as settings from '../../src/lib/settings';

// Mock settings
vi.mock('../../src/lib/settings', () => ({
  getApiKey: vi.fn(),
}));

describe('Background API Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch with API key in headers', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue('test-api-key');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const response = await fetchWithAuth('https://example.com/api', { method: 'GET' });
    const data = await response.json();

    expect(settings.getApiKey).toHaveBeenCalled();
    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe('https://example.com/api');
    
    const headers = init?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-api-key');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual({ success: true });
  });

  it('should throw AuthError if API key is missing', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue(undefined);

    await expect(fetchWithAuth('https://example.com/api')).rejects.toThrow('API key not found');
  });

  it('should return response even if not ok (responsibility of caller to handle)', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue('test-api-key');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);

    const response = await fetchWithAuth('https://example.com/api');
    expect(response.status).toBe(401);
  });
});
