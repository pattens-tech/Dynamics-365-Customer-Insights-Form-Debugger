/**
 * popup.js — Handles the extension popup UI for toggling cache bypass
 *
 * This script manages the "Disable Cache" checkbox in the extension popup.
 * It persists the user's preference to chrome.storage and notifies the background
 * script when the setting changes.
 */

import { STORAGE_KEYS, DEFAULTS, MESSAGE_TYPES } from './config.js';

/**
 * Reference to the cache toggle checkbox element
 * @type {HTMLInputElement}
 */
const nocacheToggle = document.getElementById("nocache-toggle");

/**
 * Initialize the toggle state from storage on popup open.
 * Defaults to enabled (true) if no preference is stored.
 */
chrome.storage.local.get([STORAGE_KEYS.NOCACHE_ENABLED], (data) => {
  if (chrome.runtime.lastError) {
    console.error('[D365 Form Tester] Error reading storage:', chrome.runtime.lastError);
    // Use default value on error
    nocacheToggle.checked = DEFAULTS.NOCACHE_ENABLED;
    return;
  }
  nocacheToggle.checked = data[STORAGE_KEYS.NOCACHE_ENABLED] ?? DEFAULTS.NOCACHE_ENABLED;
});

/**
 * Listen for changes to the no-cache toggle checkbox.
 * When toggled:
 * 1. Saves the new preference to chrome.storage.local
 * 2. Sends a message to the background script to apply the change
 */
nocacheToggle.addEventListener("change", () => {
  const enabled = nocacheToggle.checked;

  chrome.storage.local.set({ [STORAGE_KEYS.NOCACHE_ENABLED]: enabled }, () => {
    if (chrome.runtime.lastError) {
      console.error('[D365 Form Tester] Error saving to storage:', chrome.runtime.lastError);
      return;
    }

    // Only send message if storage was successful
    chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TOGGLE_NOCACHE, enabled }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[D365 Form Tester] Error sending message:', chrome.runtime.lastError);
      }
    });
  });
});
