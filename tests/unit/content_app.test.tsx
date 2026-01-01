/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { ContentApp } from '../../src/content/ContentApp';
import * as settingsModule from '../../src/lib/settings';

// Mock chrome
const chromeMock = {
  storage: {
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    openOptionsPage: vi.fn(),
  }
};
vi.stubGlobal('chrome', chromeMock);

// Mock settings
vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  DEFAULT_SETTINGS: {
    theme: 'system',
    accentColor: 'teal',
  },
  SETTINGS_KEY: 'user_settings',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ContentApp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should apply dark class when theme is dark', async () => {
    vi.mocked(settingsModule.getSettings).mockResolvedValue({
      theme: 'dark',
      accentColor: 'teal',
      explainModel: 'gpt',
      factCheckModel: 'gpt',
      triggerMode: 'icon'
    });

    const { container } = render(<ContentApp />);

    await waitFor(() => {
      const root = container.querySelector('.openinsight-content-root');
      expect(root).toHaveClass('dark');
    });
  });

  it('should not apply dark class when theme is light', async () => {
    vi.mocked(settingsModule.getSettings).mockResolvedValue({
      theme: 'light',
      accentColor: 'teal',
      explainModel: 'gpt',
      factCheckModel: 'gpt',
      triggerMode: 'icon'
    });

    const { container } = render(<ContentApp />);

    await waitFor(() => {
      const root = container.querySelector('.openinsight-content-root');
      expect(root).not.toHaveClass('dark');
    });
  });

  it('should update theme when storage changes', async () => {
    // Initial state: Light
    vi.mocked(settingsModule.getSettings).mockResolvedValue({
      theme: 'light',
      accentColor: 'teal',
      explainModel: 'gpt',
      factCheckModel: 'gpt',
      triggerMode: 'icon'
    });

    const { container } = render(<ContentApp />);

    // Verify initial
    await waitFor(() => {
      const root = container.querySelector('.openinsight-content-root');
      expect(root).not.toHaveClass('dark');
    });

    // Check if listener was registered
    expect(chromeMock.storage.onChanged.addListener).toHaveBeenCalled();
    const listener = chromeMock.storage.onChanged.addListener.mock.calls[0][0];
    
    // Simulate storage change
    act(() => {
      listener({
        user_settings: {
          newValue: {
            theme: 'dark',
            accentColor: 'teal',
            explainModel: 'gpt',
            factCheckModel: 'gpt',
            triggerMode: 'icon'
          }
        }
      }, 'local');
    });

    // Verify update
    await waitFor(() => {
      const root = container.querySelector('.openinsight-content-root');
      expect(root).toHaveClass('dark');
    });
  });
});
