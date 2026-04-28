import { defineBackground } from "wxt/sandbox";
import { ingest, domainOf } from "../src/memory-client.js";

interface CapturePayload {
  url: string;
  title: string;
  text: string;
  source: string;
  extras?: Record<string, unknown>;
}

function isUnscriptableUrl(url: string): boolean {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("view-source:") ||
    url.startsWith("https://chrome.google.com/webstore")
  );
}

async function runCapture(tabId: number, source: string): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url || !tab.title) return;
  if (isUnscriptableUrl(tab.url)) return;
  let text = "";
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const sel = window.getSelection()?.toString() ?? "";
        return sel.length > 0 ? sel : document.body.innerText.slice(0, 12000);
      },
    });
    text = typeof result === "string" ? result : "";
  } catch {
    // Some pages (e.g. file://, restricted schemes) reject script injection.
    // Fall back to URL+title only rather than crashing the listener.
    text = "";
  }
  await ingest(`${tab.title}\n\n${tab.url}\n\n${text}`, {
    source,
    url: tab.url,
    title: tab.title,
    capturedAt: new Date().toISOString(),
    domain: domainOf(tab.url),
  });
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "save-to-memory",
      title: "Save to LedgerMem",
      contexts: ["selection", "page"],
    });
  });

  chrome.contextMenus.onClicked.addListener((_info, tab) => {
    if (tab?.id !== undefined) void runCapture(tab.id, "context-menu");
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== "save-selection") return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined) await runCapture(tab.id, "hotkey");
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Only accept messages from this extension's own contexts (content script,
    // popup, side panel). Reject anything coming from other extensions or
    // arbitrary web pages even if the manifest changes later.
    if (sender.id !== chrome.runtime.id) return false;
    if (msg?.type === "capture" && sender.tab?.id !== undefined) {
      const payload = msg.payload as CapturePayload;
      void (async () => {
        await ingest(payload.text, {
          source: payload.source,
          url: payload.url,
          title: payload.title,
          capturedAt: new Date().toISOString(),
          domain: domainOf(payload.url),
          ...(payload.extras ?? {}),
        });
        sendResponse({ ok: true });
      })();
      return true;
    }
    return false;
  });
});
