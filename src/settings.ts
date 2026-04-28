export interface Settings {
  apiKey: string;
  workspaceId: string;
  defaultWorkspaceId: string;
  hotkey: string;
}

const DEFAULTS: Settings = {
  apiKey: "",
  workspaceId: "",
  defaultWorkspaceId: "",
  hotkey: "Ctrl+Shift+L",
};

export async function loadSettings(): Promise<Settings> {
  // Read from local storage first; chrome.storage.sync mirrors values to Google's
  // servers in plaintext, which is a poor home for API keys. Migrate any legacy
  // values out of sync storage on first read.
  const local = (await chrome.storage.local.get(
    Object.keys(DEFAULTS),
  )) as Partial<Settings>;
  if (local.apiKey || local.workspaceId) {
    return { ...DEFAULTS, ...local };
  }
  const synced = (await chrome.storage.sync.get(
    Object.keys(DEFAULTS),
  )) as Partial<Settings>;
  if (synced.apiKey || synced.workspaceId) {
    await chrome.storage.local.set(synced);
    await chrome.storage.sync.remove(Object.keys(DEFAULTS));
    return { ...DEFAULTS, ...synced };
  }
  return { ...DEFAULTS, ...local };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.local.set(patch);
  // Belt-and-braces: clear any plaintext copies that may sit in sync storage.
  await chrome.storage.sync.remove(Object.keys(DEFAULTS));
}
