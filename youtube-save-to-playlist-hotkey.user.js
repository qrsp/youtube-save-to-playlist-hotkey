// ==UserScript==
// @name         Youtube Save To Playlist Hotkey
// @version      0.1
// @author       qrsp
// @license MIT
// @match        http://www.youtube.com/*
// @match        https://www.youtube.com/*
// @include      http://www.youtube.com/*
// @include      https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function (d) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function deleteFromPlaylist() {
    d.querySelector(
      'ytd-playlist-panel-video-renderer[selected] path[d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"]',
    ).parentElement.parentElement.click();

    await delay(500);

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

  /**
   * Pressing 'p' simulates a click on YouTube's "Save" button to open the dialog.
   */
  async function openSaveToPlaylistDialog() {
    d.querySelector(
      "yt-button-shape#button-shape yt-touch-feedback-shape",
    ).click();

    await delay(500);

    let saveButton = d.querySelector(
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

  function saveToPlaylist(playlistname) {
    openSaveToPlaylistDialog();
    let spans = d.querySelectorAll(
      ".yt-core-attributed-string.yt-list-item-view-model__title.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--word-wrapping",
    );
    let targetSpan = null;

    spans.forEach((span) => {
      if (span.textContent.trim() === playlistname) {
        targetSpan = span;
      }
    });

    if (targetSpan) {
      targetSpan.click();
    } else {
      console.log("Span with text" + playlistname + "not found");
    }
  }

  function addKeydownEventListener(key, fun) {
    d.addEventListener(
      "keydown",
      (evt) => {
        // Avoid capturing if user holds Ctrl/Alt/Meta, or if in a text field, etc.
        if (
          evt.key === key &&
          !evt.ctrlKey &&
          !evt.altKey &&
          !evt.metaKey &&
          evt.target.tagName !== "INPUT" &&
          evt.target.tagName !== "TEXTAREA" &&
          evt.target.contentEditable !== "true"
        ) {
          // Prevent YouTube from interpreting 'p' in any other way
          evt.preventDefault();
          evt.stopPropagation();

          // Attempt to open the "Save to playlist" dialog
          fun();
        }
      },
      true,
    );
  }
  addKeydownEventListener("v", () => saveToPlaylist("checklist2"));
  addKeydownEventListener("a", () => saveToPlaylist("checklist"));
  addKeydownEventListener("p", openSaveToPlaylistDialog);
  addKeydownEventListener("n", deleteFromPlaylist);
})(document);
