// background.js — Edge Manifest V3 service worker (module)
console.log("Service worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  // Initialize default state
  chrome.storage.local.set({ enabledByDefault: true });
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "TOGGLE_CLASS") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (!tabs[0]) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (className) => {
          document.documentElement.classList.toggle(className);
        },
        args: [message.className],
      });
    });
  }
});
