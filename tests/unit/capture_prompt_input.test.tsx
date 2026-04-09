/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CapturePromptInput } from "../../src/content/components/CapturePromptInput";

describe("CapturePromptInput Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render nothing when not active", () => {
    const { container } = render(
      <CapturePromptInput
        isActive={false}
        position={{ x: 100, y: 100, width: 200, height: 200 }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render an input positioned near the capture region when active", () => {
    render(
      <CapturePromptInput
        isActive={true}
        position={{ x: 100, y: 100, width: 200, height: 200 }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    
    const container = screen.getByTestId("capture-prompt-container");
    expect(container).toBeDefined();
    // Should position it below the region (y = 100 + 200 = 300px)
    expect(container.style.top).toBe("308px"); // 300 + 8px margin
    expect(container.style.left).toBe("100px");
  });

  it("should call onSubmit with the typed prompt when Enter is pressed", () => {
    const onSubmitMock = vi.fn();
    render(
      <CapturePromptInput
        isActive={true}
        position={{ x: 0, y: 0, width: 10, height: 10 }}
        onSubmit={onSubmitMock}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Add a prompt (optional)...");
    
    act(() => {
      fireEvent.change(input, { target: { value: "explain this image" } });
    });
    
    act(() => {
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    expect(onSubmitMock).toHaveBeenCalledWith("explain this image");
  });

  it("should call onCancel when Escape is pressed", () => {
    const onCancelMock = vi.fn();
    render(
      <CapturePromptInput
        isActive={true}
        position={{ x: 0, y: 0, width: 10, height: 10 }}
        onSubmit={vi.fn()}
        onCancel={onCancelMock}
      />
    );

    const input = screen.getByPlaceholderText("Add a prompt (optional)...");
    
    act(() => {
      fireEvent.keyDown(input, { key: "Escape", code: "Escape" });
    });

    expect(onCancelMock).toHaveBeenCalled();
  });
});
