import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "OpenInsight",
  version: "1.0.2",
  description: "AI-powered text explanation and fact-checking.",
  icons: {
    16: "logos/icons/icon-16.png",
    32: "logos/icons/icon-32.png",
    48: "logos/icons/icon-48.png",
    128: "logos/icons/icon-128.png",
  },
  /**
   * Permissions:
   * - storage: Required for chrome.storage.local (settings, encrypted API keys)
   *
   * Note: host_permissions are not needed as content_scripts.matches covers injection.
   * The content script CSS is injected programmatically via Shadow DOM to ensure isolation.
   */
  permissions: ["storage"],
  background: {
    service_worker: "src/background/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/content.ts"],
      run_at: "document_idle", // Ensures page is loaded before content script runs
    },
  ],
  action: {
    default_popup: "src/popup/popup.html",
  },
  options_ui: {
    page: "src/options/options.html",
    open_in_tab: true,
  },
});
