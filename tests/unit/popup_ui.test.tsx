/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import Popup from '../../src/popup/Popup.js';
import * as settings from '../../src/lib/settings.js';

// Mock settings module
vi.mock('../../src/lib/settings.js', () => ({
  getSettings: vi.fn(),
  DEFAULT_SETTINGS: {
    theme: 'system',
    accentColor: 'indigo',
    explainModel: 'test-model',
    factCheckModel: 'test-model',
    triggerMode: 'icon',
  },
}));

// Mock PopupHeader
vi.mock('../../src/popup/components/PopupHeader.js', () => ({
  PopupHeader: () => <div data-testid="popup-header">PopupHeader Mock</div>,
}));

// Mock chrome
const chromeMock = {
  runtime: {
    openOptionsPage: vi.fn(),
  },
};
vi.stubGlobal('chrome', chromeMock);

describe('Popup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settings.getSettings).mockResolvedValue(settings.DEFAULT_SETTINGS);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading state initially', async () => {
    vi.mocked(settings.getSettings).mockReturnValue(new Promise(() => {}));
    render(<Popup />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('renders the UI correctly with settings', async () => {
    const customSettings = {
      ...settings.DEFAULT_SETTINGS,
      accentColor: 'rose' as const,
    };
    vi.mocked(settings.getSettings).mockResolvedValue(customSettings);

    render(<Popup />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    });

    // Verify accent color attribute
    const wrapper = screen.getByTestId('popup-header').parentElement;
    expect(wrapper?.getAttribute('data-accent')).toBe('rose');

    // Verify Open Settings button
    const button = screen.getByRole('button', { name: /open settings/i });
    expect(button).toBeDefined();
  });

  it('opens options page when settings button is clicked', async () => {
    render(<Popup />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    });

    const button = screen.getByRole('button', { name: /open settings/i });
    fireEvent.click(button);

    expect(chromeMock.runtime.openOptionsPage).toHaveBeenCalledTimes(1);
  });
});