import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App(): JSX.Element {
  const [status, setStatus] = useState("");

  async function saveCurrent(): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = window.getSelection()?.toString() ?? "";
        const text = sel || document.body.innerText.slice(0, 12000);
        chrome.runtime.sendMessage({
          type: "capture",
          payload: {
            url: window.location.href,
            title: document.title,
            text,
            source: "popup",
          },
        });
      },
    });
    setStatus("Saved.");
  }

  function openSidepanel(): void {
    void chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  }

  function openOptions(): void {
    void chrome.runtime.openOptionsPage();
  }

  return (
    <div style={{ width: 280, padding: 12, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 8px" }}>Mnemo</h2>
      <button onClick={saveCurrent} style={{ width: "100%", marginBottom: 6 }}>
        Save current page
      </button>
      <button onClick={openSidepanel} style={{ width: "100%", marginBottom: 6 }}>
        Open search panel
      </button>
      <button onClick={openOptions} style={{ width: "100%" }}>
        Settings
      </button>
      <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{status}</p>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
