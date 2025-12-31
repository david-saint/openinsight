import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'OpenInsight',
  version: '1.0.0',
  description: 'AI-powered text explanation and fact-checking.',
  icons: {
    16: 'logos/logo-transparent.png',
    48: 'logos/logo-transparent.png',
    128: 'logos/logo-transparent.png',
  },
  permissions: ['storage', 'activeTab'],
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content.ts'],
    },
  ],
  action: {
    default_popup: 'src/popup/popup.html',
  },
  options_ui: {
    page: 'src/options/options.html',
    open_in_tab: true,
  },
});
