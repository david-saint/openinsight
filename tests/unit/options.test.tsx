/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Options from '../../src/options/Options.js';
import * as settings from '../../src/lib/settings.js';

// Mock settings module
vi.mock('../../src/lib/settings.js', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  getApiKey: vi.fn(),
  saveApiKey: vi.fn(),
  DEFAULT_SETTINGS: {
    theme: 'system',
    accentColor: 'teal',
    explainModel: 'google/gemini-2.0-flash-exp:free',
    factCheckModel: 'google/gemini-2.0-flash-exp:free',
    triggerMode: 'icon',
    explainSettings: { temperature: 0.7, max_tokens: 512, system_prompt: 'explain' },
    factCheckSettings: { temperature: 0.3, max_tokens: 512, system_prompt: 'factcheck' },
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

  it('allows changing model preferences', async () => {
    render(<Options />);
    
    const explainSelect = await screen.findByLabelText(/explain model/i);
    const factCheckSelect = await screen.findByLabelText(/fact-check model/i);
    
    fireEvent.change(explainSelect, { target: { value: 'anthropic/claude-3-haiku:free' } });
    fireEvent.change(factCheckSelect, { target: { value: 'openai/gpt-4o-mini' } });
    
    expect(settings.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      explainModel: 'anthropic/claude-3-haiku:free',
      factCheckModel: 'openai/gpt-4o-mini',
    }));
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