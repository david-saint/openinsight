/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSelection } from '../../src/content/selection';

describe('Selection Listener', () => {
  it('should return null if no text is selected', () => {
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => '',
      rangeCount: 0,
    });
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it('should return selection data if text is selected', () => {
    const mockRange = {
      getBoundingClientRect: () => ({ top: 10, left: 10, width: 100, height: 20 }),
    };
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => 'Hello World',
      rangeCount: 1,
      getRangeAt: () => mockRange,
    });

    const result = handleSelection();
    expect(result).toEqual({
      text: 'Hello World',
      rect: expect.any(Object),
    });
  });
});
