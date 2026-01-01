/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
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

// Mock PopupHeader to simplify testing (and avoid deep rendering issues if any)
vi.mock('../../src/popup/components/PopupHeader.js', () => ({
  PopupHeader: () => <div data-testid="popup-header">PopupHeader Mock</div>,
}));

describe('Popup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settings.getSettings).mockResolvedValue(settings.DEFAULT_SETTINGS);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading state initially', async () => {
    // Make getSettings pending forever to check loading state
    vi.mocked(settings.getSettings).mockReturnValue(new Promise(() => {}));
    
    render(<Popup />);
    
    // Expect a loading indicator (text or skeleton)
    // We'll assume a text like "Loading..." or similar based on Options.tsx pattern
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('fetches settings on mount', async () => {
    render(<Popup />);
    
    await waitFor(() => {
        expect(settings.getSettings).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the PopupHeader after loading', async () => {
    render(<Popup />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    });

    expect(screen.getByTestId('popup-header')).toBeDefined();
  });
});
