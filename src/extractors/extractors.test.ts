// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractYouTubeTranscript, isYouTube } from "./youtube.js";
import { extractTwitterThread, isTwitter } from "./twitter.js";
import { extractRedditPost, formatReddit, isReddit } from "./reddit.js";
import { domainOf } from "../memory-client.js";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("URL detectors", () => {
  it("flags YouTube URLs", () => {
    expect(isYouTube("https://www.youtube.com/watch?v=xxx")).toBe(true);
    expect(isYouTube("https://example.com")).toBe(false);
  });
  it("flags Twitter / X URLs", () => {
    expect(isTwitter("https://twitter.com/x/status/1")).toBe(true);
    expect(isTwitter("https://x.com/x/status/1")).toBe(true);
  });
  it("flags Reddit URLs", () => {
    expect(isReddit("https://www.reddit.com/r/foo")).toBe(true);
  });
});

describe("YouTube transcript extractor", () => {
  it("returns formatted [ts] text rows", () => {
    document.body.innerHTML = `
      <ytd-transcript-segment-renderer>
        <div class="segment-timestamp">0:05</div>
        <div class="segment-text">hello world</div>
      </ytd-transcript-segment-renderer>
      <ytd-transcript-segment-renderer>
        <div class="segment-timestamp">0:10</div>
        <div class="segment-text">second line</div>
      </ytd-transcript-segment-renderer>
    `;
    const text = extractYouTubeTranscript(document);
    expect(text).toContain("[0:05] hello world");
    expect(text).toContain("[0:10] second line");
  });

  it("returns empty string when no transcript present", () => {
    expect(extractYouTubeTranscript(document)).toBe("");
  });
});

describe("Twitter thread extractor", () => {
  it("concatenates tweet text in order", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">Alice</div>
        <div data-testid="tweetText">First tweet</div>
      </article>
      <article data-testid="tweet">
        <div data-testid="User-Name">Alice</div>
        <div data-testid="tweetText">Second tweet</div>
      </article>
    `;
    const text = extractTwitterThread(document);
    expect(text).toContain("First tweet");
    expect(text).toContain("Second tweet");
  });
});

describe("Reddit extractor", () => {
  it("captures post title and limits to 5 top comments", () => {
    document.body.innerHTML = `
      <h1>Post Title</h1>
      <shreddit-post>Body text here.</shreddit-post>
      ${Array.from({ length: 8 })
        .map((_, i) => `<shreddit-comment>Comment ${i + 1}</shreddit-comment>`)
        .join("")}
    `;
    const cap = extractRedditPost(document);
    expect(cap.postTitle).toBe("Post Title");
    expect(cap.topComments).toHaveLength(5);
    const md = formatReddit(cap);
    expect(md).toContain("# Post Title");
  });
});

describe("memory-client mock", () => {
  it("derives domain from URL", () => {
    expect(domainOf("https://example.com/x")).toBe("example.com");
    expect(domainOf("not a url")).toBe("");
  });

  it("ingest forwards to LedgerMem.add when configured (mocked)", async () => {
    const fakeAdd = vi.fn(async () => undefined);
    vi.doMock("@ledgermem/memory", () => ({
      LedgerMem: vi.fn(() => ({ add: fakeAdd, search: vi.fn() })),
    }));
    // loadSettings reads `chrome.storage.local` first and falls back to
    // `chrome.storage.sync` only when local is empty. Mocking only `sync`
    // crashed the test with "Cannot read properties of undefined (reading
    // 'get')" the moment loadSettings ran — provide both surfaces.
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        local: {
          get: vi.fn(async () => ({ apiKey: "k", workspaceId: "w" })),
          set: vi.fn(async () => undefined),
        },
        sync: {
          get: vi.fn(async () => ({})),
          remove: vi.fn(async () => undefined),
        },
      },
    };
    const { ingest } = await import("../memory-client.js");
    await ingest("hello", {
      source: "test",
      url: "https://example.com",
      title: "Example",
      capturedAt: "2025-01-01",
      domain: "example.com",
    });
    expect(fakeAdd).toHaveBeenCalledOnce();
  });
});
