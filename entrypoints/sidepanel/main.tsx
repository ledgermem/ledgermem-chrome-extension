import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { create } from "zustand";
import { search, domainOf } from "../../src/memory-client.js";

interface SearchState {
  query: string;
  results: Array<{ id?: string; content?: string; metadata?: Record<string, unknown> }>;
  domainOnly: boolean;
  setQuery: (q: string) => void;
  setResults: (
    r: Array<{ id?: string; content?: string; metadata?: Record<string, unknown> }>,
  ) => void;
  toggleDomainOnly: () => void;
}

const useStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  domainOnly: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  toggleDomainOnly: () => set((s) => ({ domainOnly: !s.domainOnly })),
}));

function App(): JSX.Element {
  const { query, setQuery, results, setResults, domainOnly, toggleDomainOnly } =
    useStore();
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    void chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => setCurrentDomain(tab?.url ? domainOf(tab.url) : ""));
  }, []);

  useEffect(() => {
    setError("");
    if (!query) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = (await search(query, {
          limit: 20,
          domain: domainOnly ? currentDomain : undefined,
        })) as SearchState["results"];
        setResults(r);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, domainOnly, currentDomain, setResults]);

  return (
    <div style={{ padding: 12, fontFamily: "system-ui" }}>
      <h3 style={{ margin: "0 0 8px" }}>Search memories</h3>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search…"
        style={{ width: "100%", padding: 6, marginBottom: 6 }}
      />
      <label style={{ fontSize: 12 }}>
        <input type="checkbox" checked={domainOnly} onChange={toggleDomainOnly} /> Only{" "}
        {currentDomain || "current domain"}
      </label>
      {error && <p style={{ color: "crimson", fontSize: 12 }}>{error}</p>}
      <ul style={{ paddingLeft: 16 }}>
        {results.map((r, i) => (
          <li key={r.id ?? i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13 }}>{(r.content ?? "").slice(0, 200)}</div>
            <a
              href={safeHref(r.metadata?.url)}
              target="_blank"
              rel="noreferrer noopener"
              style={{ fontSize: 11 }}
            >
              {String(r.metadata?.title ?? r.metadata?.url ?? "")}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Allowlist link schemes to prevent javascript:/data: XSS via untrusted metadata.url values.
function safeHref(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) return "#";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "#";
  } catch {
    return "#";
  }
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
