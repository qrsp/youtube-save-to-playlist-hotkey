// ==UserScript==
// @name         Youtube Save To Playlist Hotkey
// @version      0.1
// @author       qrsp
// @updateURL    https://raw.githubusercontent.com/qrsp/youtube-save-to-playlist-hotkey/main/youtube-save-to-playlist-hotkey.user.js
// @downloadURL  https://raw.githubusercontent.com/qrsp/youtube-save-to-playlist-hotkey/main/youtube-save-to-playlist-hotkey.user.js
// @license MIT
// @match        http://www.youtube.com/*
// @match        https://www.youtube.com/*
// @include      http://www.youtube.com/*
// @include      https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/**
 * YouTube Save To Playlist Hotkey Userscript
 *
 * This userscript adds keyboard shortcuts for quickly managing YouTube playlists:
 * - 'v' key: Save current video to "checklist2" playlist
 * - 'a' key: Save current video to "checklist" playlist
 * - 'p' key: Open the save to playlist dialog
 * - 'n' key: Delete currently selected video from playlist
 */

(function (document) {
  function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function deleteFromPlaylist() {
    // Click the three-dot menu icon for the selected playlist video
    // Uses SVG path selector to find the menu icon
    document.querySelector(
      'ytd-playlist-panel-video-renderer[selected] path[d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"]',
    ).parentElement.parentElement.click();

    await delay(500);

    // Find and click the delete button using SVG path selector for trash icon
    let deleteButton = document.querySelector(
      '[d="M19 3h-4V2a1 1 0 00-1-1h-4a1 1 0 00-1 1v1H5a2 2 0 00-2 2h18a2 2 0 00-2-2ZM6 19V7H4v12a4 4 0 004 4h8a4 4 0 004-4V7h-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2Zm4-11a1 1 0 00-1 1v8a1 1 0 102 0V9a1 1 0 00-1-1Zm4 0a1 1 0 00-1 1v8a1 1 0 002 0V9a1 1 0 00-1-1Z"]',
    ).parentElement.parentElement;
    if (deleteButton) {
      deleteButton.click();
    } else {
      console.log(
        "Could not find 'Delete' button. Adjust the selector if needed.",
      );
    }
  }

  async function openSaveToPlaylistDialog() {
    // Click the initial button
    document.querySelector(
      "yt-button-shape#button-shape yt-touch-feedback-shape",
    ).click();

    await delay(500);

    // Find and click the save button using SVG path selector for bookmark icon
    let saveButton = document.querySelector(
      '[d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z"]',
    ).parentElement.parentElement;
    if (saveButton) {
      saveButton.click();
    } else {
      console.log(
        "Could not find 'Save' button. Adjust the selector if needed.",
      );
    }
  }

  function saveToPlaylist(playlistName) {
    openSaveToPlaylistDialog();

    // Find all playlist title elements in the dialog
    let playlistTitleElements = document.querySelectorAll(
      ".yt-core-attributed-string.yt-list-item-view-model__title.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--word-wrapping",
    );
    let targetSpan = null;

    // Search for the playlist with the matching name
    playlistTitleElements.forEach((span) => {
      if (span.textContent.trim() === playlistName) {
        targetSpan = span;
      }
    });

    // Click the matching playlist to save the video
    if (targetSpan) {
      targetSpan.click();
    } else {
      console.log("Span with text " + playlistName + " not found");
    }
  }

  /**
   * Adds a keydown event listener for a specific key with safety checks
   * @param {string} key - The key to listen for
   * @param {Function} callback - The function to execute when the key is pressed
   */
  function addKeydownEventListener(key, callback) {
    document.addEventListener(
      "keydown",
      (event) => {
        // Only trigger if:
        // - The exact key is pressed
        // - No modifier keys are held (Ctrl, Alt, Meta/Cmd)
        // - User is not typing in an input field, textarea, or contentEditable element
        if (
          event.key === key &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey &&
          event.target.tagName !== "INPUT" &&
          event.target.tagName !== "TEXTAREA" &&
          event.target.contentEditable !== "true"
        ) {
          // Prevent default behavior and stop event propagation
          event.preventDefault();
          event.stopPropagation();

          // Execute the associated function
          callback();
        }
      },
      true, // Use capture phase to ensure we catch the event early
    );
  }

  addKeydownEventListener("v", () => saveToPlaylist("checklist2"));
  addKeydownEventListener("a", () => saveToPlaylist("checklist"));
  addKeydownEventListener("p", openSaveToPlaylistDialog);
  addKeydownEventListener("n", deleteFromPlaylist);
})(document);
