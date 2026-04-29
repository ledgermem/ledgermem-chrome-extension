import { Mnemo } from "@getmnemo/memory";
import { loadSettings } from "./settings.js";

export interface CaptureMetadata {
  source: string;
  url: string;
  title: string;
  capturedAt: string;
  domain: string;
  [extra: string]: unknown;
}

export async function getMemoryOrThrow(): Promise<Mnemo> {
  const settings = await loadSettings();
  if (!settings.apiKey || !settings.workspaceId) {
    throw new Error("Mnemo not configured. Open Options to set credentials.");
  }
  return new Mnemo({
    apiKey: settings.apiKey,
    workspaceId: settings.workspaceId || settings.defaultWorkspaceId,
  });
}

export async function ingest(
  content: string,
  metadata: CaptureMetadata,
): Promise<void> {
  const memory = await getMemoryOrThrow();
  await memory.add(content, { metadata });
}

export async function search(
  query: string,
  opts: { limit?: number; domain?: string } = {},
): Promise<unknown[]> {
  const memory = await getMemoryOrThrow();
  const results = (await memory.search(query, {
    limit: opts.limit ?? 10,
  })) as Array<{ metadata?: { domain?: string } }>;
  if (opts.domain) {
    return results.filter((r) => r.metadata?.domain === opts.domain);
  }
  return results;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
