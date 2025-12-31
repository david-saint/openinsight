import styles from './style.css?inline';

console.log('OpenInsight content script initialized.');

// This function will be used to inject styles into the Shadow DOM
export function injectStyles(shadowRoot: ShadowRoot) {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
}

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selectedText.length > 0) {
    console.log('Text selected:', selectedText);
    // Future: Logic to show pop-up UI
  }
});
