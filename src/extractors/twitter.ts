// Best-effort capture of an X/Twitter thread.
// Walks visible tweet articles and concatenates their text into one memory.

export function extractTwitterThread(doc: Document): string {
  const articles = doc.querySelectorAll<HTMLElement>('article[data-testid="tweet"]');
  if (articles.length === 0) return "";
  const out: string[] = [];
  articles.forEach((article, i) => {
    const author = article
      .querySelector<HTMLElement>('div[data-testid="User-Name"]')
      ?.innerText.replace(/\n+/g, " ")
      .trim();
    const text = article
      .querySelector<HTMLElement>('div[data-testid="tweetText"]')
      ?.innerText.trim();
    if (text) out.push(`[#${i + 1}] ${author ?? ""}\n${text}`);
  });
  return out.join("\n\n---\n\n");
}

export function isTwitter(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h.endsWith("twitter.com") || h.endsWith("x.com");
  } catch {
    return false;
  }
}
