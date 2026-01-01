import { describe, it, expect } from 'vitest';
import { calculateTriggerPosition } from '../../src/content/positioning';

describe('Trigger Positioning Logic', () => {
  it('should calculate position at the end of the selection', () => {
    const mockRect = {
      top: 100,
      left: 100,
      bottom: 120,
      right: 300,
      width: 200,
      height: 20,
    } as DOMRect;

    // Mock scroll
    const scrollX = 50;
    const scrollY = 50;

    const position = calculateTriggerPosition(mockRect, scrollX, scrollY);

    // Expect near the bottom right of the selection
    // top + height + scrollY
    expect(position.top).toBe(120 + 50); 
    // left + width + scrollX
    expect(position.left).toBe(300 + 50);
  });
});
