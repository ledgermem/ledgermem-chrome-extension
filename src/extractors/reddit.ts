// Captures a Reddit post and its top 5 comments.

export interface RedditCapture {
  postTitle: string;
  postBody: string;
  topComments: string[];
}

export function extractRedditPost(doc: Document): RedditCapture {
  const postTitle =
    doc.querySelector<HTMLElement>("h1")?.innerText.trim() ?? "";
  const postBody =
    doc
      .querySelector<HTMLElement>('[data-test-id="post-content"], shreddit-post')
      ?.innerText.trim() ?? "";
  const commentEls = doc.querySelectorAll<HTMLElement>(
    'shreddit-comment, [data-testid="comment"]',
  );
  const topComments: string[] = [];
  for (let i = 0; i < commentEls.length && topComments.length < 5; i += 1) {
    const text = commentEls[i].innerText.trim();
    if (text) topComments.push(text);
  }
  return { postTitle, postBody, topComments };
}

export function formatReddit(capture: RedditCapture): string {
  const header = capture.postTitle ? `# ${capture.postTitle}\n\n` : "";
  const body = capture.postBody ? `${capture.postBody}\n\n` : "";
  const comments =
    capture.topComments.length > 0
      ? `## Top comments\n\n${capture.topComments
          .map((c, i) => `**${i + 1}.** ${c}`)
          .join("\n\n")}`
      : "";
  return `${header}${body}${comments}`.trim();
}

export function isReddit(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("reddit.com");
  } catch {
    return false;
  }
}
