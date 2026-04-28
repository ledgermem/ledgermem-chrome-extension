import { defineContentScript } from "wxt/sandbox";
import { extractYouTubeTranscript, isYouTube } from "../src/extractors/youtube.js";
import { extractTwitterThread, isTwitter } from "../src/extractors/twitter.js";
import {
  extractRedditPost,
  formatReddit,
  isReddit,
} from "../src/extractors/reddit.js";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    injectFloatingButton();
  },
});

function injectFloatingButton(): void {
  let btn: HTMLButtonElement | null = null;
  document.addEventListener("mouseup", (event) => {
    // Mouseup on the button itself fires before its `click` listener. If we
    // recreate the button here, the click handler bound to the old node is
    // discarded and the user's click does nothing. Bail out when the event
    // target is our own injected button.
    if (event.target instanceof Node && btn?.contains(event.target)) return;
    const sel = window.getSelection()?.toString().trim();
    if (!sel || sel.length < 5) {
      btn?.remove();
      btn = null;
      return;
    }
    if (btn) btn.remove();
    btn = document.createElement("button");
    btn.textContent = "Save to memory";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: "2147483647",
      padding: "8px 12px",
      background: "#111",
      color: "#fff",
      borderRadius: "6px",
      border: "0",
      cursor: "pointer",
      fontFamily: "system-ui",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener("click", () => {
      const url = window.location.href;
      const title = document.title;
      const source = pickSource(url);
      const payload = buildCapturePayload(source, sel, url, title);
      void chrome.runtime.sendMessage({ type: "capture", payload });
      btn?.remove();
      btn = null;
    });
    document.body.appendChild(btn);
  });
}

function pickSource(url: string): string {
  if (isYouTube(url)) return "youtube";
  if (isTwitter(url)) return "twitter";
  if (isReddit(url)) return "reddit";
  return "selection";
}

interface CapturePayload {
  url: string;
  title: string;
  text: string;
  source: string;
  extras?: Record<string, unknown>;
}

function buildCapturePayload(
  source: string,
  selection: string,
  url: string,
  title: string,
): CapturePayload {
  if (source === "youtube") {
    const transcript = extractYouTubeTranscript(document);
    return {
      url,
      title,
      text: transcript || selection,
      source,
      extras: { hasTranscript: Boolean(transcript) },
    };
  }
  if (source === "twitter") {
    const thread = extractTwitterThread(document);
    return { url, title, text: thread || selection, source };
  }
  if (source === "reddit") {
    const cap = extractRedditPost(document);
    return {
      url,
      title,
      text: formatReddit(cap) || selection,
      source,
      extras: { commentCount: cap.topComments.length },
    };
  }
  return { url, title, text: selection, source };
}
