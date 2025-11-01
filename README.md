# YouTube Save to Playlist Hotkey

[![Install Userscript](https://img.shields.io/badge/Install%20Userscript-Playlist%20HOTKEY-blue?style=for-the-badge)](https://raw.githubusercontent.com/qrsp/youtube-save-to-playlist-hotkey/refs/heads/main/youtube-save-to-playlist-hotkey.user.js)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1-blue)

A userscript that adds convenient keyboard shortcuts for managing YouTube playlists. Save videos to specific playlists or remove them with simple key presses!

## 🎮 Usage

Once installed, the following keyboard shortcuts will be available on any YouTube page:

| Key | Action |
|-----|--------|
| `P` | Open the "Save to playlist" dialog |
| `A` | Save current video to "checklist" playlist |
| `V` | Save current video to "checklist2" playlist |
| `N` | Remove current video from playlist |

## ⚙️ Customization

To customize the playlist names or add more shortcuts:

1. Open your userscript manager
2. Find "Youtube Save To Playlist Hotkey" in your installed scripts
3. Click "Edit"
4. Modify the playlist names or add new shortcuts at the bottom of the script:

```javascript
// Change these lines to use your own playlist names
addKeydownEventListener("v", () => saveToPlaylist("YOUR_PLAYLIST_NAME_1"));
addKeydownEventListener("a", () => saveToPlaylist("YOUR_PLAYLIST_NAME_2"));

// Add more shortcuts if needed
addKeydownEventListener("s", () => saveToPlaylist("Another Playlist"));
```

Available keys for shortcuts: any single letter or number key that doesn't conflict with YouTube's existing shortcuts.
