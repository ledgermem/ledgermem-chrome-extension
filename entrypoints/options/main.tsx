import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadSettings, saveSettings, type Settings } from "../../src/settings.js";

function App(): JSX.Element {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  if (!settings) return <p>Loading…</p>;

  function update<K extends keyof Settings>(key: K, value: Settings[K]): void {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(): Promise<void> {
    if (!settings) return;
    await saveSettings(settings);
    setStatus("Saved.");
  }

  return (
    <div style={{ maxWidth: 480, padding: 24, fontFamily: "system-ui" }}>
      <h1>Mnemo — Options</h1>
      <label style={{ display: "block", marginBottom: 12 }}>
        API key
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => update("apiKey", e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Workspace ID
        <input
          value={settings.workspaceId}
          onChange={(e) => update("workspaceId", e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Default workspace ID
        <input
          value={settings.defaultWorkspaceId}
          onChange={(e) => update("defaultWorkspaceId", e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Hotkey (set in chrome://extensions/shortcuts)
        <input
          value={settings.hotkey}
          onChange={(e) => update("hotkey", e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <p style={{ color: "#666", marginTop: 12 }}>{status}</p>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
