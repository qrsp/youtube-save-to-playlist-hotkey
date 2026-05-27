// ==UserScript==
// @name         Youtube Save To Playlist Hotkey
// @version      0.2
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
 * This userscript adds keyboard shortcuts for quickly managing YouTube playlists.
 * Fully refactored for superior reliability, easy customization, and an elegant visual toast notification system.
 */

(function (document) {
  'use strict';

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = {
    // Map shortcut keys (lowercase) to target playlist names
    playlists: {
      v: "checklist2",
      a: "checklist",
    },
    // Map shortcut keys (lowercase) to specific actions
    actions: {
      p: "openDialog",
      n: "deleteCurrent",
    },
    // Polling settings for element detection
    timeoutMs: 5000,
    pollIntervalMs: 50,
    // Visual feedback settings
    enableToasts: true,
    toastDurationMs: 3000,
  };

  // ==========================================
  // 2. CSS SELECTOR REGISTRY
  // ==========================================
  const SELECTORS = {
    // Main button to open "More actions" or playlist options on YouTube
    menuButton: "yt-button-shape#button-shape yt-touch-feedback-shape",
    
    // Save button icon inside the actions dropdown (SVG path matching bookmark icon)
    saveButtonIcon: '[d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z"]',
    
    // Playlist item checkbox titles inside the save popup dialog
    playlistTitle: ".ytAttributedStringHost.ytListItemViewModelTitle.ytAttributedStringWhiteSpacePreWrap.ytAttributedStringWordWrapping",
    
    // Three-dot menu button on the currently playing/selected video in a playlist panel
    playlistVideoMenuIcon: 'ytd-playlist-panel-video-renderer[selected] path[d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"]',
    
    // Delete button inside the playlist panel video menu (SVG path matching trash icon)
    deleteButtonIcon: '[d="M19 3h-4V2a1 1 0 00-1-1h-4a1 1 0 00-1 1v1H5a2 2 0 00-2 2h18a2 2 0 00-2-2ZM6 19V7H4v12a4 4 0 004 4h8a4 4 0 004-4V7h-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2Zm4-11a1 1 0 00-1 1v8a1 1 0 102 0V9a1 1 0 00-1-1Zm4 0a1 1 0 00-1 1v8a1 1 0 002 0V9a1 1 0 00-1-1Z"]',
    
    // Dialog element to check if save-to-playlist modal is already open
    dialogElement: "ytd-add-to-playlist-renderer",
  };

  // ==========================================
  // 3. LOGGER & UTILITIES
  // ==========================================
  const logger = {
    log: (msg, ...args) => console.log(`[YT Save Hotkey] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[YT Save Hotkey] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[YT Save Hotkey] ${msg}`, ...args),
  };

  /**
   * Simple helper to wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = CONFIG.timeoutMs) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for element: ${selector}`));
        }
      }, CONFIG.pollIntervalMs);
    });
  }

  /**
   * Wait for an SVG path selector to exist and return its parent at a specified depth
   */
  function waitForSvgParent(pathSelector, depth = 2, timeout = CONFIG.timeoutMs) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const path = document.querySelector(pathSelector);
        if (path) {
          let element = path;
          for (let i = 0; i < depth; i++) {
            if (element.parentElement) {
              element = element.parentElement;
            } else {
              break;
            }
          }
          clearInterval(interval);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for SVG path parent: ${pathSelector}`));
        }
      }, CONFIG.pollIntervalMs);
    });
  }

  /**
   * Wait for an element matching selector that contains the exact text content
   */
  function waitForElementWithText(selector, text, timeout = CONFIG.timeoutMs) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (el.textContent.trim() === text) {
            clearInterval(interval);
            resolve(el);
            return;
          }
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for element with text: "${text}"`));
        }
      }, CONFIG.pollIntervalMs);
    });
  }

  /**
   * Check if the playlist save dialog is currently open and visible in the DOM
   */
  function isDialogOpen() {
    const dialog = document.querySelector(SELECTORS.dialogElement);
    return !!(dialog && dialog.isConnected);
  }

  // ==========================================
  // 4. PREMIUM GLASSMORPHIC TOAST SYSTEM
  // ==========================================
  function showToast(message, type = 'info') {
    if (!CONFIG.enableToasts) return;

    let container = document.getElementById('yt-save-hotkey-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-save-hotkey-toast-container';
      document.body.appendChild(container);

      const style = document.createElement('style');
      style.textContent = `
        #yt-save-hotkey-toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          font-family: "Roboto", "Arial", sans-serif;
        }
        .yt-save-hotkey-toast {
          background: rgba(21, 21, 21, 0.85);
          color: #f1f1f1;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.377);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 4px solid #3ea6ff;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
          transform: translateX(100px);
          opacity: 0;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .yt-save-hotkey-toast.show {
          transform: translateX(0);
          opacity: 1;
        }
        .yt-save-hotkey-toast.success {
          border-left-color: #2ba640;
        }
        .yt-save-hotkey-toast.error {
          border-left-color: #ff4e4e;
        }
        .yt-save-hotkey-toast.info {
          border-left-color: #3ea6ff;
        }
      `;
      document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.className = `yt-save-hotkey-toast ${type}`;

    let iconHtml = '';
    if (type === 'success') {
      iconHtml = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ba640" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconHtml = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4e4e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else {
      iconHtml = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ea6ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    container.appendChild(toast);

    // Force reflow to trigger transition
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      toast.style.transform = 'translateX(100px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, CONFIG.toastDurationMs);
  }

  // ==========================================
  // 5. CORE FUNCTIONALITIES
  // ==========================================
  async function deleteFromPlaylist() {
    logger.log("Attempting to remove current video from the playlist panel...");
    showToast("Removing from playlist...", "info");
    try {
      // Find the selected video three-dot menu
      const menuBtn = await waitForSvgParent(SELECTORS.playlistVideoMenuIcon);
      menuBtn.click();

      // Find the delete button in the popup menu
      const deleteBtn = await waitForSvgParent(SELECTORS.deleteButtonIcon);
      deleteBtn.click();

      logger.log("Successfully removed video from playlist.");
      showToast("Removed from playlist", "success");
    } catch (err) {
      logger.error("Failed to remove video from playlist", err);
      showToast("Failed to remove video", "error");
    }
  }

  async function openSaveToPlaylistDialog() {
    logger.log("Opening the save-to-playlist dialog...");
    try {
      const menuBtn = await waitForElement(SELECTORS.menuButton);
      menuBtn.click();

      const saveBtn = await waitForSvgParent(SELECTORS.saveButtonIcon);
      saveBtn.click();
      
      logger.log("Save dialog trigger clicked successfully.");
    } catch (err) {
      logger.error("Failed to open save playlist dialog", err);
      showToast("Could not open save menu", "error");
      throw err;
    }
  }

  async function saveToPlaylist(playlistName) {
    logger.log(`Attempting to toggle video in playlist: "${playlistName}"`);
    showToast(`Saving to "${playlistName}"...`, "info");
    try {
      if (!isDialogOpen()) {
        await openSaveToPlaylistDialog();
      }

      // Find and click the target playlist item by name
      const targetSpan = await waitForElementWithText(SELECTORS.playlistTitle, playlistName);
      targetSpan.click();

      logger.log(`Successfully toggled video in: "${playlistName}"`);
      showToast(`Toggled playlist: "${playlistName}"`, "success");
    } catch (err) {
      logger.error(`Error toggling playlist "${playlistName}"`, err);
      showToast(`Failed: ${err.message}`, "error");
    }
  }

  // ==========================================
  // 6. SHORTCUT INTERCEPTOR & INITIALIZATION
  // ==========================================
  function isTyping(event) {
    const target = event.target;
    if (!target) return false;

    const tagName = target.tagName;
    const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA';
    const isEditable = target.isContentEditable || target.getAttribute('contenteditable') === 'true';

    return isInput || isEditable;
  }

  function initializeShortcuts() {
    document.addEventListener(
      "keydown",
      (event) => {
        // Prevent triggers if typing in fields or if mod keys (Ctrl/Alt/Meta) are active
        if (isTyping(event)) return;
        if (event.ctrlKey || event.altKey || event.metaKey) return;

        const key = event.key.toLowerCase();

        // 1. Check mapped playlists config
        if (CONFIG.playlists[key]) {
          event.preventDefault();
          event.stopPropagation();
          saveToPlaylist(CONFIG.playlists[key]);
          return;
        }

        // 2. Check mapped actions config
        if (CONFIG.actions[key]) {
          event.preventDefault();
          event.stopPropagation();

          const action = CONFIG.actions[key];
          if (action === "openDialog") {
            openSaveToPlaylistDialog().then(() => {
              showToast("Playlist dialog opened", "success");
            }).catch(() => {});
          } else if (action === "deleteCurrent") {
            deleteFromPlaylist();
          }
          return;
        }
      },
      true // Capture phase to prevent YouTube intercepting these specific keys first
    );
    logger.log("Keyboard hotkeys initialized successfully.");
  }

  // Start the keyboard shortcut listener
  initializeShortcuts();

})(document);
