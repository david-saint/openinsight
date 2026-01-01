export interface SelectionData {
  text: string;
  rect: DOMRect;
  endPosition: { x: number; y: number };
}

export function handleSelection(): SelectionData | null {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length === 0 || !selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Get the exact position where the selection ends
  const endRange = document.createRange();
  endRange.setStart(range.endContainer, range.endOffset);
  endRange.collapse(true);
  const endRect = endRange.getBoundingClientRect();

  return {
    text,
    rect,
    endPosition: { x: endRect.left, y: endRect.bottom },
  };
}
