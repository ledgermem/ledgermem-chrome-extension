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
  const stored = (await chrome.storage.sync.get(Object.keys(DEFAULTS))) as Partial<Settings>;
  return { ...DEFAULTS, ...stored };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(patch);
}
