// Captures the YouTube transcript shown in the side panel.
// Returns a single string with `[mm:ss] line` per row.

interface TranscriptRow {
  timestamp: string;
  text: string;
}

export function extractYouTubeTranscript(doc: Document): string {
  const rows = doc.querySelectorAll<HTMLElement>("ytd-transcript-segment-renderer");
  if (rows.length === 0) return "";
  const out: TranscriptRow[] = [];
  rows.forEach((row) => {
    const ts = row
      .querySelector<HTMLElement>(".segment-timestamp")
      ?.innerText.trim();
    const text = row
      .querySelector<HTMLElement>(".segment-text")
      ?.innerText.trim();
    if (ts && text) out.push({ timestamp: ts, text });
  });
  return out.map((r) => `[${r.timestamp}] ${r.text}`).join("\n");
}

export function isYouTube(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("youtube.com");
  } catch {
    return false;
  }
}
