export interface Position {
  top: number;
  left: number;
}

/**
 * Calculates the absolute position for the trigger button based on the selection end point.
 * @param endPosition The x,y coordinates where the selection ends.
 * @param scrollX Current horizontal scroll offset.
 * @param scrollY Current vertical scroll offset.
 */
export function calculateTriggerPosition(
  endPosition: { x: number; y: number },
  scrollX: number = window.scrollX,
  scrollY: number = window.scrollY
): Position {
  // Position directly under the selection end point
  const top = endPosition.y + scrollY + 4; // 4px gap below the selection
  const left = endPosition.x + scrollX;

  return {
    top,
    left,
  };
}
