import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "LedgerMem",
    description:
      "Save pages, selections, YouTube transcripts, X threads, and Reddit posts to LedgerMem.",
    version: "0.1.0",
    permissions: ["storage", "tabs", "activeTab", "scripting", "sidePanel", "contextMenus"],
    host_permissions: ["<all_urls>"],
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
