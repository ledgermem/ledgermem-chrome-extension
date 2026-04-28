import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "LedgerMem",
    description:
      "Save pages, selections, YouTube transcripts, X threads, and Reddit posts to LedgerMem.",
    version: "0.1.0",
    permissions: ["storage", "tabs", "activeTab", "scripting", "sidePanel", "contextMenus"],
    // Restrict to web schemes only — `<all_urls>` would also grant file:// and ftp://
    // which we never read from. Smaller permission surface = smaller install-prompt
    // warning and less blast radius if the extension is compromised.
    host_permissions: ["http://*/*", "https://*/*"],
    minimum_chrome_version: "116",
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    side_panel: { default_path: "sidepanel.html" },
    options_ui: { page: "options.html", open_in_tab: true },
    commands: {
      "save-selection": {
        suggested_key: { default: "Ctrl+Shift+L", mac: "Command+Shift+L" },
        description: "Save current selection (or full page) to LedgerMem",
      },
    },
    action: { default_title: "LedgerMem" },
  },
  srcDir: ".",
});
