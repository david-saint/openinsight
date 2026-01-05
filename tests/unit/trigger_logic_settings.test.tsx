/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { ContentApp } from '../../src/content/ContentApp';
import * as settings from '../../src/lib/settings';
import * as selection from '../../src/content/selection';

vi.mock('../../src/lib/settings');
vi.mock('../../src/content/selection');
vi.mock('../../src/content/positioning', () => ({
  calculateTriggerPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
}));

// Mock chrome API
const mockChrome = {
  storage: {
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ContentApp Trigger Logic with Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const triggerMouseUp = async () => {
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    // Debounce wait (10ms in component) + some buffer
    await sleep(50);
  };

  const waitForElement = async (testId: string, timeout = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = screen.queryByTestId(testId);
      if (el) return el;
      await sleep(50);
    }
    return null;
  };

  it('should show trigger for short text if Explain is enabled', async () => {
    vi.mocked(settings.getSettings).mockResolvedValue({
      ...settings.DEFAULT_SETTINGS,
      enabledTabs: ['explain', 'fact-check'],
      triggerMode: 'icon',
    });

    vi.mocked(selection.handleSelection).mockReturnValue({
      text: 'Short text', // 10 chars
      rect: {} as any,
      endPosition: { x: 0, y: 0 },
      context: {} as any,
    });

    render(<ContentApp />);
    
    // Wait for mount/settings
    await sleep(50);
    
    await triggerMouseUp();

    const btn = await waitForElement('trigger-button');
    expect(btn).toBeInTheDocument();
  });

  it('should NOT show trigger for short text if ONLY Fact-check is enabled', async () => {
    vi.mocked(settings.getSettings).mockResolvedValue({
      ...settings.DEFAULT_SETTINGS,
      enabledTabs: ['fact-check'],
      triggerMode: 'icon',
    });

    vi.mocked(selection.handleSelection).mockReturnValue({
      text: 'Short text', // 10 chars
      rect: {} as any,
      endPosition: { x: 0, y: 0 },
      context: {} as any,
    });

    render(<ContentApp />);
    
    await sleep(50);
    
    await triggerMouseUp();

    const btn = screen.queryByTestId('trigger-button');
    expect(btn).not.toBeInTheDocument();
  });

  it('should show trigger for long text if ONLY Fact-check is enabled', async () => {
    vi.mocked(settings.getSettings).mockResolvedValue({
      ...settings.DEFAULT_SETTINGS,
      enabledTabs: ['fact-check'],
      triggerMode: 'icon',
    });

    vi.mocked(selection.handleSelection).mockReturnValue({
      text: 'This is a much longer text selection that should be valid for fact checking purposes.'.repeat(2),
      rect: {} as any,
      endPosition: { x: 0, y: 0 },
      context: {} as any,
    });

    render(<ContentApp />);
    
    await sleep(50);
    
    await triggerMouseUp();

    const btn = await waitForElement('trigger-button');
    expect(btn).toBeInTheDocument();
  });
});
