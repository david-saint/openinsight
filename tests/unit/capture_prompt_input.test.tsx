/**
 * @vitest-environment happy-dom
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CapturePromptInput } from "../../src/content/components/CapturePromptInput.js";

// Mock matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("CapturePromptInput Component", () => {
  const defaultPosition = { x: 100, y: 200, width: 300, height: 100 };

  it("should render nothing when not active", () => {
    const { container } = render(
      <CapturePromptInput
        isActive={false}
        position={defaultPosition}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render an input positioned near the capture region when active", () => {
    const { getByTestId } = render(
      <CapturePromptInput
        isActive={true}
        position={defaultPosition}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const container = getByTestId("capture-prompt-container");
    expect(container).toBeDefined();
    // Should position it below the region (y = 100 + 200 = 300px + 12px margin = 312px)
    expect(container.style.top).toBe("312px"); // 300 + 12px margin
    expect(container.style.left).toBe("100px");
  });

  it("should call onSubmit with the typed prompt when Enter is pressed", () => {
    const handleSubmit = vi.fn();
    render(
      <CapturePromptInput
        isActive={true}
        position={defaultPosition}
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Ask about this image...");
    
    act(() => {
      fireEvent.change(input, { target: { value: "test prompt" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    expect(handleSubmit).toHaveBeenCalledWith("test prompt");
  });

  it("should call onCancel when Escape is pressed", () => {
    const handleCancel = vi.fn();
    render(
      <CapturePromptInput
        isActive={true}
        position={defaultPosition}
        onSubmit={vi.fn()}
        onCancel={handleCancel}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    });

    expect(handleCancel).toHaveBeenCalled();
  });
});