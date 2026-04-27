# @ledgermem/chrome-extension

LedgerMem cross-browser MV3 extension. Built with [wxt](https://wxt.dev) — runs in **Chrome, Edge, Brave, and Firefox**.

## Features

- **Hotkey** `Cmd+Shift+L` (mac) / `Ctrl+Shift+L` (win/linux) → captures the current selection (or the full page if nothing is selected) → sends to LedgerMem with URL/title/timestamp metadata.
- **Floating "Save to memory" button** appears on text selection.
- **Side panel** (Chrome 114+) with live search-as-you-type and an *only this domain* filter toggle.
- **Options page** for API key, workspace ID, default workspace, and hotkey customization.
- **YouTube** → captures the open transcript with `[mm:ss]` timestamps.
- **Twitter / X** → captures every tweet in the visible thread as one memory.
- **Reddit** → captures the post body plus the top 5 comments.

## Screenshots

> _placeholder_ — `docs/screenshots/popup.png`
> _placeholder_ — `docs/screenshots/sidepanel.png`
> _placeholder_ — `docs/screenshots/options.png`

## Develop

```bash
npm install
npm run dev               # chrome
npm run dev:firefox       # firefox
npm run build             # production build → .output/chrome-mv3
npm run zip               # build + zip for store upload
```

Load unpacked: `chrome://extensions` → Developer mode → Load unpacked → `.output/chrome-mv3`.

## Settings

Open the Options page from the popup or `chrome://extensions/?options=…`. All settings sync to `chrome.storage.sync`.

| Storage key | Description |
| --- | --- |
| `apiKey` | LedgerMem API key |
| `workspaceId` | Active workspace ID |
| `defaultWorkspaceId` | Fallback workspace |
| `hotkey` | Display label (real binding is set in `chrome://extensions/shortcuts`) |

## Memory metadata

Common fields on every capture:

- `source` (`hotkey` | `selection` | `popup` | `context-menu` | `youtube` | `twitter` | `reddit`)
- `url`
- `title`
- `domain`
- `capturedAt`

Source-specific extras:

- YouTube: `hasTranscript`
- Reddit: `commentCount`

## License

MIT
