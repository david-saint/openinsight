import { describe, it, expect } from "vitest";
import { calculateTriggerPosition } from "../../src/content/positioning";

describe("Trigger Positioning Logic", () => {
  it("should calculate position at the end of the selection", () => {
    const endPosition = { x: 300, y: 120 }; // Where selection ends

    // Mock scroll
    const scrollX = 50;
    const scrollY = 50;

    const position = calculateTriggerPosition(endPosition, scrollX, scrollY);

    // Expect directly under the selection end point with 4px gap
    expect(position.top).toBe(120 + 50 + 4); // y + scrollY + gap
    expect(position.left).toBe(300 + 50); // x + scrollX
  });
});
