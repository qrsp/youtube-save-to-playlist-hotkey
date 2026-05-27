# YouTube Save to Playlist Hotkey

[![Install Userscript](https://img.shields.io/badge/Install%20Userscript-Playlist%20HOTKEY-blue?style=for-the-badge)](https://raw.githubusercontent.com/qrsp/youtube-save-to-playlist-hotkey/main/youtube-save-to-playlist-hotkey.user.js)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1-blue)

A userscript that adds convenient, highly responsive keyboard shortcuts for managing YouTube playlists. Save videos to specific playlists or remove them instantly with customizable hotkeys.

---

## Usage & Defaults

Once installed, the following default shortcuts are available on any YouTube page:

| Key | Action | Visual Toast Alert |
|:---:|:---|:---|
| **P** | Open/Toggle the "Save to playlist" dialog | `Playlist dialog opened` |
| **A** | Toggle current video in the `"checklist"` playlist | `Saving to "checklist"...` ➡️ `Toggled playlist: "checklist"` |
| **V** | Toggle current video in the `"checklist2"` playlist | `Saving to "checklist2"...` ➡️ `Toggled playlist: "checklist2"` |
| **N** | Delete the currently selected video from your playlist panel | `Removing from playlist...` ➡️ `Removed from playlist` |

---

## Features

- **Centralized Configuration**: All options are defined in a clean `CONFIG` block at the top of the script. No need to look through hundreds of lines of code to change keys or names.
- **Glassmorphic Toasts**: Elegant, non-intrusive, micro-animated dark-mode compatible notifications display at the bottom-right corner to confirm shortcut operations.
- **Smart Element Polling**: Eliminates brittle static `setTimeout` calls. The script uses robust async elements polling that instantly executes clicks the millisecond they appear in the DOM.
- **Safe Hotkey Interceptor**: Automatically bypasses hotkeys if you are typing in comments, live chat, search fields, or any editable formatting block.

---

## Customization

Customizing your playlists, shortcut keys, or toast alerts is incredibly easy:

1. Open your userscript manager (e.g., Tampermonkey, Violentmonkey).
2. Open **Youtube Save To Playlist Hotkey** in the editor.
3. Edit the `CONFIG` block located at the very top:

```javascript
// ==========================================
// 1. CONFIGURATION
// ==========================================
const CONFIG = {
  // Map shortcut keys (must be lowercase) to your playlist names
  playlists: {
    v: "checklist2",
    a: "checklist",
    s: "My Custom Playlist", // Simply add a new line to bind a new playlist!
  },
  // Map shortcut keys (must be lowercase) to built-in actions
  actions: {
    p: "openDialog",
    n: "deleteCurrent",
  },
  // Polling settings (in milliseconds)
  timeoutMs: 5000,
  pollIntervalMs: 50,
  // Visual feedback settings
  enableToasts: true,       // Set to false if you want silent operations
  toastDurationMs: 3000,    // Toast visibility length
};
```

4. Save the changes in your userscript manager, and reload YouTube!
