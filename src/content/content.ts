import { mountContentApp } from './mount';

console.log('OpenInsight content script initialized.');

// Mount the shadow DOM container immediately
mountContentApp();

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selectedText.length > 0) {
    console.log('Text selected:', selectedText);
    // Future: Logic to show pop-up UI
  }
});
