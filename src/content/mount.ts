import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import styles from './style.css?inline';
import { ContentApp } from './ContentApp';

const ROOT_ID = 'openinsight-root';
let root: Root | null = null;

export function injectStyles(shadowRoot: ShadowRoot) {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
}

export function mountContentApp() {
  let host = document.getElementById(ROOT_ID);

  if (!host) {
    host = document.createElement('div');
    host.id = ROOT_ID;
    document.body.appendChild(host);
  }

  let shadow = host.shadowRoot;
  if (!shadow) {
    shadow = host.attachShadow({ mode: 'open' });
    injectStyles(shadow);
    
    // Create a container for React
    const reactRoot = document.createElement('div');
    shadow.appendChild(reactRoot);
    
    root = createRoot(reactRoot);
    root.render(React.createElement(ContentApp));
  }
}

export function unmountContentApp() {
  if (root) {
    root.unmount();
    root = null;
  }
  const host = document.getElementById(ROOT_ID);
  if (host) {
    host.remove();
  }
}
