export interface SelectionData {
  text: string;
  rect: DOMRect;
}

export function handleSelection(): SelectionData | null {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length === 0 || !selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    text,
    rect,
  };
}
