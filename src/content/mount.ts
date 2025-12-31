import styles from './style.css?inline';

const ROOT_ID = 'openinsight-root';

export function injectStyles(shadowRoot: ShadowRoot) {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
}

export function mountContentApp(): ShadowRoot {
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
  }

  return shadow;
}

export function unmountContentApp() {
  const host = document.getElementById(ROOT_ID);
  if (host) {
    host.remove();
  }
}
