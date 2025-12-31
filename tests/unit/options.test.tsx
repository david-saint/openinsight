/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Options from '../../src/options/Options';
import * as settings from '../../src/lib/settings';

// Mock settings module
vi.mock('../../src/lib/settings', () => ({
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
    const logo = await screen.findByAltText('OpenInsight Logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toContain('logo-transparent.png');
  });
});