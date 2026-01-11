import { useState, useLayoutEffect } from "react";

const POPOVER_WIDTH = 320;
const POPOVER_ESTIMATED_HEIGHT = 300; // Estimated max height for positioning calculations
const VIEWPORT_PADDING = 16; // Minimum distance from viewport edges

interface Position {
  top: number;
  left: number;
}

export const usePopoverPosition = (
  isOpen: boolean,
  originalPosition?: Position
) => {
  const [adjustedPosition, setAdjustedPosition] = useState<Position | null>(
    null
  );

  useLayoutEffect(() => {
    if (!isOpen || !originalPosition) {
      setAdjustedPosition(null);
      return;
    }

    const { top, left } = originalPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Convert absolute position to viewport-relative
    const relativeLeft = left - scrollX;
    const relativeTop = top - scrollY;

    let adjustedLeft = left;
    let adjustedTop = top;

    // Check if popover would overflow right edge
    if (relativeLeft + POPOVER_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      // Move to the left of the trigger point
      adjustedLeft = left - POPOVER_WIDTH;
    }

    // Check if popover would overflow left edge
    if (adjustedLeft - scrollX < VIEWPORT_PADDING) {
      // Pin to left edge with padding
      adjustedLeft = scrollX + VIEWPORT_PADDING;
    }

    // Check if popover would overflow bottom edge
    if (
      relativeTop + POPOVER_ESTIMATED_HEIGHT + VIEWPORT_PADDING >
      viewportHeight
    ) {
      // Move above the trigger point (subtract estimated height + some gap)
      adjustedTop = top - POPOVER_ESTIMATED_HEIGHT - 8;
    }

    // Check if popover would overflow top edge
    if (adjustedTop - scrollY < VIEWPORT_PADDING) {
      // Pin to top edge with padding
      adjustedTop = scrollY + VIEWPORT_PADDING;
    }

    // Optimization: Only update state if position actually changed
    if (adjustedTop === top && adjustedLeft === left) {
      // If position is unchanged, ensure state is null to use originalPosition.
      // We explicitly set to null. React's useState bailout will prevent re-render if it was already null.
      setAdjustedPosition(null);
    } else {
      // If position changed, only update if values differ from current state
      setAdjustedPosition((prev) => {
        if (prev && prev.top === adjustedTop && prev.left === adjustedLeft) {
          return prev;
        }
        return { top: adjustedTop, left: adjustedLeft };
      });
    }
  }, [isOpen, originalPosition]);

  return adjustedPosition || originalPosition;
};
