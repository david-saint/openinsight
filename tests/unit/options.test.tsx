/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Options from '../../src/options/Options';
import * as storage from '../../src/lib/storage';

// Mock storage module
vi.mock('../../src/lib/storage', () => ({
  getEncrypted: vi.fn(),
  setEncrypted: vi.fn(),
}));

describe('Options Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    vi.mocked(storage.getEncrypted).mockResolvedValue(undefined);
    render(<Options />);
    
    expect(screen.getByText('OpenInsight Settings')).toBeDefined();
    expect(screen.getByLabelText('OpenRouter API Key')).toBeDefined();
  });

  it('loads saved API key', async () => {
    vi.mocked(storage.getEncrypted).mockResolvedValue('test-key');
    render(<Options />);
    
    await waitFor(() => {
      const input = screen.getByLabelText('OpenRouter API Key') as HTMLInputElement;
      expect(input.value).toBe('test-key');
    });
  });

  it('saves API key', async () => {
    vi.mocked(storage.getEncrypted).mockResolvedValue(undefined);
    render(<Options />);
    
    const input = screen.getByLabelText('OpenRouter API Key') as HTMLInputElement;
    const saveButton = screen.getByText('Save Settings');
    
    fireEvent.change(input, { target: { value: 'new-key' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(storage.setEncrypted).toHaveBeenCalledWith('openrouter_api_key', 'new-key', expect.any(String));
      expect(screen.getByText('Settings saved successfully!')).toBeDefined();
    });
  });
});
