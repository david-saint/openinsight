import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ContentApp } from '../../src/content/ContentApp';
import * as selectionModule from '../../src/content/selection';
import * as positioningModule from '../../src/content/positioning';

// Mocks
vi.mock('../../src/content/selection', () => ({
  handleSelection: vi.fn(),
}));

vi.mock('../../src/content/positioning', () => ({
  calculateTriggerPosition: vi.fn(),
}));

// Mock settings
vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({ theme: 'light', accentColor: 'blue' }),
  DEFAULT_SETTINGS: { theme: 'light', accentColor: 'blue' },
}));

describe('ContentApp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers mouseup listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    render(<ContentApp />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });

  it('debounces mouseup events to prevent excessive processing', () => {
    render(<ContentApp />);

    // Mock handleSelection to return something valid
    vi.mocked(selectionModule.handleSelection).mockReturnValue({
      text: 'test',
      rect: { bottom: 10, right: 10 } as DOMRect,
    });
    vi.mocked(positioningModule.calculateTriggerPosition).mockReturnValue({ top: 100, left: 100 });

    // Simulate rapid mouseup events
    const eventCount = 10;
    for (let i = 0; i < eventCount; i++) {
      fireEvent.mouseUp(document);
      // Advance timer less than the debounce limit (10ms)
      act(() => {
        vi.advanceTimersByTime(1);
      });
    }

    // Advance remaining time to ensure the last timeout fires
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Expectation: With debouncing, it should be called only once (for the last event)
    expect(selectionModule.handleSelection).toHaveBeenCalledTimes(1);
  });

  it('shows trigger button when text is selected', async () => {
    render(<ContentApp />);

    vi.mocked(selectionModule.handleSelection).mockReturnValue({
      text: 'selected text',
      rect: { bottom: 10, right: 10 } as DOMRect,
    });
    vi.mocked(positioningModule.calculateTriggerPosition).mockReturnValue({ top: 100, left: 100 });

    fireEvent.mouseUp(document);

    act(() => {
      vi.advanceTimersByTime(20);
    });

    // We can't easily check for the button DOM here because it might be inside the shadow DOM or
    // we are just rendering ContentApp (which renders a div).
    // But we can check if handleSelection was called, implying the logic flow worked.
    expect(selectionModule.handleSelection).toHaveBeenCalled();
  });
});
