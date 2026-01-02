export interface SelectionData {
  text: string;
  rect: DOMRect;
  endPosition: { x: number; y: number };
  context: {
    paragraph: string;
    pageTitle: string;
    pageDescription: string;
  };
}

export function handleSelection(): SelectionData | null {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  // 1. Basic presence check
  if (!text || !selection || selection.rangeCount === 0) {
    return null;
  }

  // 2. Character count validation (10-2000 chars)
  if (text.length < 10 || text.length > 2000) {
    return null;
  }

  // 3. Word validation (at least one full word)
  if (!/[a-zA-Z]+/.test(text)) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 4. Context Extraction
  // Get full paragraph containing selection
  let paragraph = "";
  const container = range.commonAncestorContainer;
  const parentElement = container.nodeType === 1 // Node.ELEMENT_NODE 
    ? (container as HTMLElement) 
    : container.parentElement;
  
  if (parentElement) {
    paragraph = parentElement.innerText || "";
  }

  const pageTitle = document.title;
  const pageDescription = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || "";

  // Get the exact position where the selection ends
  const endRange = document.createRange();
  endRange.setStart(range.endContainer, range.endOffset);
  endRange.collapse(true);
  const endRect = endRange.getBoundingClientRect();

  return {
    text,
    rect,
    endPosition: { x: endRect.left, y: endRect.bottom },
    context: {
      paragraph,
      pageTitle,
      pageDescription
    }
  };
}
