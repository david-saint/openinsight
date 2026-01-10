/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSelection } from "../../src/content/selection";

describe("Selection Logic", () => {
  const setupMockSelection = (text: string) => {
    const mockRect = { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 };
    const mockRange = {
      getBoundingClientRect: () => mockRect,
      endContainer: document.createTextNode(text),
      endOffset: text.length,
      commonAncestorContainer: { 
        nodeType: 1, 
        innerText: "Context Paragraph",
        parentElement: null 
      }
    };
    const mockEndRange = {
      setStart: vi.fn(),
      collapse: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, bottom: 0 }),
    };
    
    document.createRange = vi.fn().mockReturnValue(mockEndRange);
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => text,
      rangeCount: 1,
      getRangeAt: () => mockRange,
    });
  };

  it("should return null if no text is selected", () => {
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => "",
      rangeCount: 0,
    });
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it("should return null if selection is too short (< 10 chars)", () => {
    setupMockSelection("Too short");
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it("should return null if selection is too long (> 2000 chars)", () => {
    setupMockSelection("a".repeat(2001));
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it("should return null if selection has no full words", () => {
    setupMockSelection("1234567890!!!");
    const result = handleSelection();
    expect(result).toBeNull();
  });

  it("should return selection data for valid selection", () => {
    const validText = "This is a valid selection with enough words.";
    setupMockSelection(validText);
    const result = handleSelection();
    expect(result).not.toBeNull();
    expect(result?.text).toBe(validText);
    expect(typeof result?.getContext).toBe('function');
  });

  it("should include context in selection data when getContext is called", () => {
    document.title = "Page Title";
    const meta = document.createElement('meta');
    meta.name = "description";
    meta.content = "Page Description";
    document.head.appendChild(meta);

    const validText = "Valid selection for context test.";
    setupMockSelection(validText);
    
    const result = handleSelection();
    // Context is not computed yet

    const context = result?.getContext();
    expect(context).toEqual({
      paragraph: expect.any(String),
      pageTitle: "Page Title",
      pageDescription: "Page Description"
    });
  });
});
