/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Options from '../../src/options/Options';

// Mock chrome.storage
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('Options Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    chromeMock.storage.local.get.mockResolvedValue({});
    render(<Options />);
    
    expect(screen.getByText('OpenInsight Settings')).toBeDefined();
    expect(screen.getByLabelText('OpenRouter API Key')).toBeDefined();
  });

  it('loads saved API key', async () => {
    chromeMock.storage.local.get.mockResolvedValue({ openrouter_api_key: 'test-key' });
    render(<Options />);
    
    await waitFor(() => {
      const input = screen.getByLabelText('OpenRouter API Key') as HTMLInputElement;
      expect(input.value).toBe('test-key');
    });
  });

  it('saves API key', async () => {
    chromeMock.storage.local.get.mockResolvedValue({});
    render(<Options />);
    
    const input = screen.getByLabelText('OpenRouter API Key') as HTMLInputElement;
    const saveButton = screen.getByText('Save Settings');
    
    fireEvent.change(input, { target: { value: 'new-key' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ openrouter_api_key: 'new-key' });
      expect(screen.getByText('Settings saved successfully!')).toBeDefined();
    });
  });
});
