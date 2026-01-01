/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSelection } from "../../src/content/selection";

describe("Selection Listener", () => {
  it("should return null if no text is selected", () => {
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => "",
      rangeCount: 0,
    });
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it("should return selection data if text is selected", () => {
    const mockTextNode = document.createTextNode("Hello World");
    const mockRect = {
      top: 10,
      left: 10,
      width: 100,
      height: 20,
      bottom: 30,
      right: 110,
    };
    const mockRange = {
      getBoundingClientRect: () => mockRect,
      endContainer: mockTextNode,
      endOffset: 11,
    };
    const mockEndRange = {
      setStart: vi.fn(),
      collapse: vi.fn(),
      getBoundingClientRect: () => ({ left: 110, bottom: 30 }),
    };
    const originalCreateRange = document.createRange;
    document.createRange = vi.fn().mockReturnValue(mockEndRange);

    window.getSelection = vi.fn().mockReturnValue({
      toString: () => "Hello World",
      rangeCount: 1,
      getRangeAt: () => mockRange,
    });

    const result = handleSelection();
    expect(result).toEqual({
      text: "Hello World",
      rect: expect.any(Object),
      endPosition: { x: 110, y: 30 },
    });

    document.createRange = originalCreateRange;
  });
});
