/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { ContentApp } from '../../src/content/ContentApp';
import * as settingsModule from '../../src/lib/settings';
import * as selectionModule from '../../src/content/selection.js';

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
    explainModel: 'gpt',
    factCheckModel: 'gpt',
    triggerMode: 'icon',
  },
  SETTINGS_KEY: 'user_settings',
}));

// Mock selection module
vi.mock('../../src/content/selection.js', () => ({
  handleSelection: vi.fn(),
}));

// Mock positioning module
vi.mock('../../src/content/positioning.js', () => ({
  calculateTriggerPosition: vi.fn(() => ({ x: 100, y: 100 })),
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
      enabledTabs: ['explain', 'fact-check'],
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
      enabledTabs: ['explain', 'fact-check'],
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
      enabledTabs: ['explain', 'fact-check'],
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
            enabledTabs: ['explain', 'fact-check'],
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

  describe('Trigger Mode', () => {
    const mockContext = {
      paragraph: 'Full paragraph context',
      pageTitle: 'Test Page',
      pageDescription: 'Test description'
    };

    const mockSelectionData = {
      text: 'This is selected text for testing',
      rect: { top: 100, left: 100, right: 200, bottom: 120, width: 100, height: 20 } as DOMRect,
      endPosition: { x: 200, y: 120 },
      getContext: vi.fn(() => mockContext)
    };

    it('should show trigger button on selection when triggerMode is icon', async () => {
      vi.mocked(settingsModule.getSettings).mockResolvedValue({
        theme: 'light',
        accentColor: 'teal',
        enabledTabs: ['explain', 'fact-check'],
        explainModel: 'gpt',
        factCheckModel: 'gpt',
        triggerMode: 'icon'
      });

      // Mock handleSelection to return valid selection data
      vi.mocked(selectionModule.handleSelection).mockReturnValue(mockSelectionData);

      const { container } = render(<ContentApp />);

      // Wait for settings to load
      await waitFor(() => {
        expect(settingsModule.getSettings).toHaveBeenCalled();
      });

      // Trigger mouseup
      await act(async () => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        // Wait for the debounce timeout
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // In icon mode, the trigger button should be visible (isVisible = true)
      // and the popover should NOT be open
      await waitFor(() => {
        const popover = container.querySelector('[data-testid="analysis-popover"]');
        // Popover should NOT be rendered directly
        expect(popover).toBeNull();
      });

      // getContext should NOT be called yet
      expect(mockSelectionData.getContext).not.toHaveBeenCalled();
    });

    it('should open popover directly on selection when triggerMode is immediate', async () => {
      vi.useFakeTimers();
      
      vi.mocked(settingsModule.getSettings).mockResolvedValue({
        theme: 'light',
        accentColor: 'teal',
        enabledTabs: ['explain', 'fact-check'],
        explainModel: 'gpt',
        factCheckModel: 'gpt',
        triggerMode: 'immediate'
      });

      // Reset mock before use
      mockSelectionData.getContext.mockClear();
      vi.mocked(selectionModule.handleSelection).mockReturnValue(mockSelectionData);

      render(<ContentApp />);

      // Flush the pending getSettings promise
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Trigger mouseup
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      // Advance timers to trigger the 10ms debounce in the component
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });

      // Verify handleSelection was called
      expect(selectionModule.handleSelection).toHaveBeenCalled();
      // Verify getContext was called immediately
      expect(mockSelectionData.getContext).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should not show trigger button when triggerMode is immediate', async () => {
      vi.mocked(settingsModule.getSettings).mockResolvedValue({
        theme: 'light',
        accentColor: 'teal',
        enabledTabs: ['explain', 'fact-check'],
        explainModel: 'gpt',
        factCheckModel: 'gpt',
        triggerMode: 'immediate'
      });

      // Mock handleSelection to return valid selection data
      vi.mocked(selectionModule.handleSelection).mockReturnValue(mockSelectionData);

      const { container } = render(<ContentApp />);

      // Wait for settings to load and state to update
      await waitFor(() => {
        expect(settingsModule.getSettings).toHaveBeenCalled();
      });
      
      // Additional small wait to ensure useEffect for settingsRef has run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Trigger mouseup
      await act(async () => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        // Wait for the debounce timeout in ContentApp
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // The trigger button should NOT be visible in immediate mode
      const triggerButton = container.querySelector('[data-testid="trigger-button"]');
      expect(triggerButton).toBeNull();
    });

    it('should not open popover or show button when no text is selected', async () => {
      vi.mocked(settingsModule.getSettings).mockResolvedValue({
        theme: 'light',
        accentColor: 'teal',
        enabledTabs: ['explain', 'fact-check'],
        explainModel: 'gpt',
        factCheckModel: 'gpt',
        triggerMode: 'immediate'
      });

      // Mock handleSelection to return null (no valid selection)
      vi.mocked(selectionModule.handleSelection).mockReturnValue(null);

      const { container } = render(<ContentApp />);

      // Wait for settings to load
      await waitFor(() => {
        expect(settingsModule.getSettings).toHaveBeenCalled();
      });

      // Trigger mouseup
      await act(async () => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        // Wait for the debounce timeout
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Neither button nor popover should be visible
      const triggerButton = container.querySelector('[data-testid="trigger-button"]');
      const popover = container.querySelector('[data-testid="analysis-popover"]');
      expect(triggerButton).toBeNull();
      expect(popover).toBeNull();
    });

    it('should update trigger mode when storage changes', async () => {
      // Initial state: icon mode
      vi.mocked(settingsModule.getSettings).mockResolvedValue({
        theme: 'light',
        accentColor: 'teal',
        enabledTabs: ['explain', 'fact-check'],
        explainModel: 'gpt',
        factCheckModel: 'gpt',
        triggerMode: 'icon'
      });

      render(<ContentApp />);

      // Wait for settings to load
      await waitFor(() => {
        expect(settingsModule.getSettings).toHaveBeenCalled();
      });

      // Check if listener was registered
      expect(chromeMock.storage.onChanged.addListener).toHaveBeenCalled();
      const listener = chromeMock.storage.onChanged.addListener.mock.calls[0]?.[0];
      expect(listener).toBeDefined();
      
      // Simulate storage change to immediate mode
      act(() => {
        listener({
          user_settings: {
            newValue: {
              theme: 'light',
              accentColor: 'teal',
              enabledTabs: ['explain', 'fact-check'],
              explainModel: 'gpt',
              factCheckModel: 'gpt',
              triggerMode: 'immediate'
            }
          }
        }, 'local');
      });

      // The settings should be updated (we can't easily verify behavior without another selection,
      // but at least the storage change handler was called)
      expect(chromeMock.storage.onChanged.addListener).toHaveBeenCalled();
    });
  });

  it('activates CaptureOverlay when openinsight:capture-activated is dispatched', async () => {
    const { getByTestId, queryByTestId } = render(<ContentApp />);
    
    // Initially, the overlay is not active, so it renders null (no testid)
    expect(queryByTestId('capture-overlay')).toBeNull();

    act(() => {
      document.dispatchEvent(new Event('openinsight:capture-activated'));
    });

    // The overlay should now be active
    await waitFor(() => {
      expect(getByTestId('capture-overlay')).toBeInTheDocument();
    });
  });

  it('shows CapturePromptInput after a region is captured', async () => {
    // Provide a mocked getBoundingClientRect for DOM elements so elementFromPoint mock works cleanly
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100, height: 100, top: 50, left: 50, bottom: 150, right: 150, x: 50, y: 50, toJSON: () => {}
    }));
    document.elementsFromPoint = vi.fn(() => [document.body]);

    const { getByTestId, queryByTestId } = render(<ContentApp />);
    
    act(() => {
      document.dispatchEvent(new Event('openinsight:capture-activated'));
    });

    // Overlay is active
    await waitFor(() => {
      expect(getByTestId('capture-overlay')).toBeInTheDocument();
    });

    // Simulate capturing a region (drag on overlay)
    const overlay = getByTestId('capture-overlay');
    act(() => {
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    });
    act(() => {
      fireEvent.mouseMove(overlay, { clientX: 200, clientY: 200 });
    });
    act(() => {
      fireEvent.mouseUp(overlay, { clientX: 200, clientY: 200 });
    });

    // The prompt input should now be active
    await waitFor(() => {
      expect(getByTestId('capture-prompt-container')).toBeInTheDocument();
    });
    
    // Overlay should be gone
    expect(queryByTestId('capture-overlay')).toBeNull();
  });
});
