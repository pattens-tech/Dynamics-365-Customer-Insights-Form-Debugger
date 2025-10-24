/**
 * popup.js — Handles the extension popup UI for toggling cache bypass
 *
 * This script manages the "Disable Cache" checkbox in the extension popup.
 * It persists the user's preference to chrome.storage and notifies the background
 * script when the setting changes.
 *
 * Config is loaded from config.js (included via script tag before this file)
 */

/**
 * Reference to the cache toggle checkbox element
 * @type {HTMLInputElement}
 */
const nocacheToggle = document.getElementById("nocache-toggle");

/**
 * Initialize the toggle state from storage on popup open.
 * Defaults to enabled (true) if no preference is stored.
 */
chrome.storage.local.get([CONFIG.STORAGE_KEYS.NOCACHE_ENABLED], (data) => {
  if (chrome.runtime.lastError) {
    console.error('[D365 Form Tester] Error reading storage:', chrome.runtime.lastError);
    // Use default value on error
    nocacheToggle.checked = CONFIG.DEFAULTS.NOCACHE_ENABLED;
    return;
  }
  nocacheToggle.checked = data[CONFIG.STORAGE_KEYS.NOCACHE_ENABLED] ?? CONFIG.DEFAULTS.NOCACHE_ENABLED;
});

/**
 * Listen for changes to the no-cache toggle checkbox.
 * When toggled:
 * 1. Saves the new preference to chrome.storage.local
 * 2. Sends a message to the background script to apply the change
 */
nocacheToggle.addEventListener("change", () => {
  const enabled = nocacheToggle.checked;

  chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.NOCACHE_ENABLED]: enabled }, () => {
    if (chrome.runtime.lastError) {
      console.error('[D365 Form Tester] Error saving to storage:', chrome.runtime.lastError);
      return;
    }

    // Only send message if storage was successful
    chrome.runtime.sendMessage({ type: CONFIG.MESSAGE_TYPES.TOGGLE_NOCACHE, enabled }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[D365 Form Tester] Error sending message:', chrome.runtime.lastError);
      }
    });
  });
});
