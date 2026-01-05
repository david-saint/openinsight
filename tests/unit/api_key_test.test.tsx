/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import Options from '../../src/options/Options.js';
import * as settings from '../../src/lib/settings.js';
import { BackendClient } from '../../src/lib/backend-client.js';

// Mock chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
  },
  tabs: {
    create: vi.fn(),
  },
};

vi.stubGlobal('chrome', mockChrome);

// Mock BackendClient
vi.mock('../../src/lib/backend-client.js', () => ({
  BackendClient: {
    fetchModels: vi.fn().mockResolvedValue([]),
    testKey: vi.fn().mockResolvedValue(true),
  },
}));

// Mock settings module
vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  getApiKey: vi.fn(),
  saveApiKey: vi.fn(),
  DEFAULT_SETTINGS: {
    theme: 'system',
    accentColor: 'teal',
    enabledTabs: ['explain', 'fact-check'],
    explainModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
    factCheckModel: 'm',
    triggerMode: 'icon',
    explainSettings: { temperature: 0.7, max_tokens: 512, system_prompt: 's' },
    factCheckSettings: { temperature: 0.3, max_tokens: 512, system_prompt: 's' },
  },
}));

// Mock BackendClient
vi.mock('../../src/lib/backend-client', () => ({
  BackendClient: {
    testApiKey: vi.fn(),
  },
}));

describe('API Key Verification Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settings.getSettings).mockResolvedValue(settings.DEFAULT_SETTINGS);
    vi.mocked(settings.getApiKey).mockResolvedValue('existing-key');
  });

  afterEach(() => {
    cleanup();
  });

  it('shows success state when API key is valid', async () => {
    vi.mocked(BackendClient.testApiKey).mockResolvedValue(true);
    
    render(<Options />);
    
    const testButton = await screen.findByRole('button', { name: /^test$/i });
    fireEvent.click(testButton);
    
    expect(await screen.findByText(/testing.../i)).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText(/verified/i)).toBeDefined();
      expect(screen.getByText(/api connection successful/i)).toBeDefined();
    });
  });

  it('shows error state and toast when API key is invalid', async () => {
    vi.mocked(BackendClient.testApiKey).mockRejectedValue({ 
      type: 'auth', 
      message: 'Invalid API Key' 
    });
    
    render(<Options />);
    
    const testButton = await screen.findByRole('button', { name: /^test$/i });
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeDefined();
      expect(screen.getByText(/invalid api key/i)).toBeDefined();
    });
  });

  it('resets status when API key changes', async () => {
    vi.mocked(BackendClient.testApiKey).mockResolvedValue(true);
    
    render(<Options />);
    
    const input = await screen.findByPlaceholderText('sk-or-v1-...');
    const testButton = screen.getByRole('button', { name: /^test$/i });
    
    fireEvent.click(testButton);
    await waitFor(() => expect(screen.getByText(/verified/i)).toBeDefined());
    
    fireEvent.change(input, { target: { value: 'new-key' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.queryByText(/verified/i)).toBeNull();
      expect(screen.getByText(/^test$/i)).toBeDefined();
    });
  });
});
