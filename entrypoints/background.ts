import { defineBackground } from "wxt/sandbox";
import { ingest, domainOf } from "../src/memory-client.js";

interface CapturePayload {
  url: string;
  title: string;
  text: string;
  source: string;
  extras?: Record<string, unknown>;
}

async function runCapture(tabId: number, source: string): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url || !tab.title) return;
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const sel = window.getSelection()?.toString() ?? "";
      return sel.length > 0 ? sel : document.body.innerText.slice(0, 12000);
    },
  });
  const text = typeof result === "string" ? result : "";
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
