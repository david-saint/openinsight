/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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
vi.mock('../../src/lib/settings.js', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  getApiKey: vi.fn(),
  saveApiKey: vi.fn(),
  DEFAULT_SETTINGS: {
    theme: 'system',
    accentColor: 'teal',
    enabledTabs: ['explain', 'fact-check'],
    explainModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
    factCheckModel: 'google/gemini-2.0-flash-exp:free',
    areaCaptureModel: 'google/gemini-2.0-flash-exp:free',
    triggerMode: 'icon',
    stylePreference: 'Concise',
    explainSettings: { temperature: 0.1, max_tokens: 1024, system_prompt: '' },
    factCheckSettings: { temperature: 0.1, max_tokens: 1024, system_prompt: '' },
    areaCaptureSettings: { temperature: 0.1, max_tokens: 1024, system_prompt: '' },
  },
}));

describe('Options Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settings.getSettings).mockResolvedValue(settings.DEFAULT_SETTINGS);
    vi.mocked(settings.getApiKey).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the header and main sections', async () => {
    render(<Options />);
    
    // Header
    expect(await screen.findByText('OpenInsight')).toBeDefined();
    
    // Sections
    expect(screen.getByText('Connection')).toBeDefined();
    expect(screen.getByText('Intelligence')).toBeDefined();
    expect(screen.getByText('Appearance')).toBeDefined();
    expect(screen.getByText('Behavior')).toBeDefined();
  });

  it('contains the branding logo', async () => {
    render(<Options />);
    // The Sparkles icon is used, we can check for the header text as a proxy for the branding section being present
    // or we can check for the Lucide icon if it had a specific role/label, but text is sufficient here along with header check
    expect(await screen.findByText('Epistemic Clarity Engine')).toBeDefined();
  });

  it('allows saving the API key on blur', async () => {
    render(<Options />);
    
    const input = await screen.findByPlaceholderText('sk-or-v1-...');
    
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    fireEvent.blur(input);
    
    expect(settings.saveApiKey).toHaveBeenCalledWith('new-api-key');
  });

  it('allows changing model preferences, including area capture with vision-capable models', async () => {
    render(<Options />);
    
    const explainSelect = await screen.findByLabelText(/explain model/i);
    const factCheckSelect = await screen.findByLabelText(/fact-check model/i);
    const areaCaptureSelect = await screen.findByLabelText(/area capture model/i);
    
    fireEvent.change(explainSelect, { target: { value: 'meta-llama/llama-3.3-70b-instruct:free' } });
    fireEvent.change(factCheckSelect, { target: { value: 'nvidia/nemotron-3-nano-30b-a3b:free' } });
    fireEvent.change(areaCaptureSelect, { target: { value: 'google/gemini-2.0-flash-exp:free' } });
    
    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      explainModel: 'meta-llama/llama-3.3-70b-instruct:free',
      factCheckModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
      areaCaptureModel: 'google/gemini-2.0-flash-exp:free',
    }));
  });

  it('allows selecting the area capture model from the browse modal', async () => {
    vi.mocked(BackendClient.fetchModels).mockResolvedValue([
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0', completion: '0' } },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', architecture: { input_modalities: ['text'] }, pricing: { prompt: '0', completion: '0' } },
      { id: 'meta-llama/llama-3.1-405b-instruct:free', name: 'Llama 3.1 405B', architecture: { input_modalities: ['text'] }, pricing: { prompt: '0', completion: '0' } },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', architecture: { input_modalities: ['text'] }, pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'qwen/qwen-2.5-vl-72b-instruct', name: 'Qwen 2.5 VL 72B', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek Chat V3', architecture: { input_modalities: ['text'] }, pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0.000001', completion: '0.000002' } },
    ] as any);

    render(<Options />);

    const browseButtons = await screen.findAllByTitle(/browse all models/i);
    fireEvent.click(browseButtons[2]!);

    expect(screen.queryByText('Claude 3.5 Haiku')).toBeNull();
    expect(screen.queryByText('DeepSeek Chat V3')).toBeNull();

    fireEvent.click(await screen.findByText('GPT-4o Mini'));

    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      areaCaptureModel: 'openai/gpt-4o-mini',
    }));
  });

  it('shows only vision-capable inline options for area capture', async () => {
    render(<Options />);

    const areaCaptureSelect = await screen.findByLabelText(/area capture model/i) as HTMLSelectElement;
    const optionValues = Array.from(areaCaptureSelect.options).map((option) => option.value);

    expect(optionValues).toEqual(['google/gemini-2.0-flash-exp:free']);
    expect(optionValues).not.toContain('meta-llama/llama-3.1-405b-instruct:free');
  });

  it('allows changing the theme mode', async () => {
    render(<Options />);
    
    const lightButton = await screen.findByRole('button', { name: /light/i });
    fireEvent.click(lightButton);
    
    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'light',
    }));
  });

  it('allows changing the accent color', async () => {
    render(<Options />);
    
    const indigoButton = await screen.findByLabelText(/indigo/i);
    fireEvent.click(indigoButton);
    
    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      accentColor: 'indigo',
    }));
  });

  it('allows changing the trigger mode', async () => {
    render(<Options />);
    
    const immediateButton = await screen.findByRole('button', { name: /immediate/i });
    fireEvent.click(immediateButton);
    
    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      triggerMode: 'immediate',
    }));
  });
});
