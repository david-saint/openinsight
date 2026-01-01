export interface Position {
  top: number;
  left: number;
}

/**
 * Calculates the absolute position for the trigger button based on the selection bounds.
 * @param selectionRect The bounding client rect of the selection.
 * @param scrollX Current horizontal scroll offset.
 * @param scrollY Current vertical scroll offset.
 */
export function calculateTriggerPosition(
  selectionRect: DOMRect,
  scrollX: number = window.scrollX,
  scrollY: number = window.scrollY
): Position {
  // Position near the bottom-right corner of the selection
  const top = selectionRect.bottom + scrollY;
  const left = selectionRect.right + scrollX;

  return {
    top,
    left,
  };
}
