/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import React from "react";
import { CaptureOverlay } from "../../src/content/components/CaptureOverlay";

describe("CaptureOverlay Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a mocked getBoundingClientRect for DOM elements
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 100,
      top: 50,
      left: 50,
      bottom: 150,
      right: 150,
      x: 50,
      y: 50,
      toJSON: () => {},
    }));

    document.elementsFromPoint = vi.fn((x, y) => {
      // Very basic mock just for our test targets
      if (x === 60 && y === 60) {
        // Return img or svg if they exist
        const img = document.querySelector("img");
        if (img) return [img];
        const svg = document.querySelector("svg");
        if (svg) return [svg];
      }
      return [document.body];
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the overlay when active", () => {
    render(
      <CaptureOverlay isActive={true} onCancel={vi.fn()} onCapture={vi.fn()} />,
    );
    const overlay = screen.getByTestId("capture-overlay");
    expect(overlay).toBeDefined();

    // Check if it covers the whole screen
    expect(overlay.className).toContain("fixed");
    expect(overlay.className).toContain("inset-0");
    expect(overlay.className).toContain("z-[999999]");
  });

  it("should not render anything when inactive", () => {
    const { container } = render(
      <CaptureOverlay
        isActive={false}
        onCancel={vi.fn()}
        onCapture={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  describe("Element Selection (Hover & Click)", () => {
    it("should highlight target elements (img) on hover", () => {
      // Create a target image in the DOM
      const img = document.createElement("img");
      img.src = "test.png";
      document.body.appendChild(img);

      render(
        <CaptureOverlay
          isActive={true}
          onCancel={vi.fn()}
          onCapture={vi.fn()}
        />,
      );

      const overlay = screen.getByTestId("capture-overlay");

      act(() => {
        // Dispatch mousemove on the overlay
        fireEvent.mouseMove(overlay, { clientX: 60, clientY: 60 });
      });

      // The highlight box should be rendered
      const highlight = screen.getByTestId("capture-highlight");
      expect(highlight).toBeDefined();

      // Should position the highlight based on mocked getBoundingClientRect (left: 50, top: 50, w: 100, h: 100)
      expect(highlight.style.left).toBe("50px");
      expect(highlight.style.top).toBe("50px");
      expect(highlight.style.width).toBe("100px");
      expect(highlight.style.height).toBe("100px");

      document.body.removeChild(img);
    });

    it("should trigger onCapture with element dimensions when a highlighted element is clicked", () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      document.body.appendChild(svg);

      const onCaptureMock = vi.fn();
      render(
        <CaptureOverlay
          isActive={true}
          onCancel={vi.fn()}
          onCapture={onCaptureMock}
        />,
      );

      const overlay = screen.getByTestId("capture-overlay");

      act(() => {
        fireEvent.mouseMove(overlay, { clientX: 60, clientY: 60 });
      });

      // After highlighting, click it
      act(() => {
        fireEvent.mouseDown(overlay, { clientX: 60, clientY: 60 });
        fireEvent.mouseUp(overlay, { clientX: 60, clientY: 60 });
      });

      expect(onCaptureMock).toHaveBeenCalledWith({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      });

      document.body.removeChild(svg);
    });

    it("should clear highlight if moved off a valid target element", () => {
      const img = document.createElement("img");
      document.body.appendChild(img);

      render(
        <CaptureOverlay
          isActive={true}
          onCancel={vi.fn()}
          onCapture={vi.fn()}
        />,
      );
      const overlay = screen.getByTestId("capture-overlay");

      act(() => {
        fireEvent.mouseMove(overlay, { clientX: 60, clientY: 60 });
      });

      expect(screen.queryByTestId("capture-highlight")).not.toBeNull();

      act(() => {
        // Move to the body/overlay itself
        fireEvent.mouseMove(overlay, { clientX: 200, clientY: 200 });
      });

      expect(screen.queryByTestId("capture-highlight")).toBeNull();

      document.body.removeChild(img);
    });
    describe("Freeform Bounding Box", () => {
      it("should draw a bounding box when dragging and trigger onCapture on mouseup", () => {
        const onCaptureMock = vi.fn();
        render(
          <CaptureOverlay
            isActive={true}
            onCancel={vi.fn()}
            onCapture={onCaptureMock}
          />,
        );
        const overlay = screen.getByTestId("capture-overlay");

        // Start drag
        act(() => {
          fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
        });

        // Drag
        act(() => {
          fireEvent.mouseMove(overlay, { clientX: 250, clientY: 200 });
        });

        // Box should be visible while dragging
        const highlight = screen.getByTestId("capture-highlight");
        expect(highlight.style.left).toBe("100px");
        expect(highlight.style.top).toBe("100px");
        expect(highlight.style.width).toBe("150px"); // 250 - 100
        expect(highlight.style.height).toBe("100px"); // 200 - 100

        // Stop drag
        act(() => {
          fireEvent.mouseUp(overlay);
        });

        expect(onCaptureMock).toHaveBeenCalledWith({
          x: 100,
          y: 100,
          width: 150,
          height: 100,
        });
      });

      it("should support dragging in negative direction (up-left)", () => {
        render(
          <CaptureOverlay
            isActive={true}
            onCancel={vi.fn()}
            onCapture={vi.fn()}
          />,
        );
        const overlay = screen.getByTestId("capture-overlay");

        act(() => {
          fireEvent.mouseDown(overlay, { clientX: 200, clientY: 200 });
        });

        act(() => {
          fireEvent.mouseMove(overlay, { clientX: 100, clientY: 150 });
        });

        const highlight = screen.getByTestId("capture-highlight");
        expect(highlight.style.left).toBe("100px");
        expect(highlight.style.top).toBe("150px");
        expect(highlight.style.width).toBe("100px"); // 200 - 100
        expect(highlight.style.height).toBe("50px"); // 200 - 150
      });
    });
  });
});
