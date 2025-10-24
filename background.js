// background.js — Edge Manifest V3 service worker (module)
console.log("Service worker loaded");

// Initialize default state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    highlightEnabled: true,
    nocacheEnabled: false
  });
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender) => {

  // Toggle page highlight class
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

  // Toggle Dynamics 365 no-cache fragment
  if (message?.type === "TOGGLE_NOCACHE") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab?.url) return;

      // Match any regional Dynamics 365 asset domain (e.g., assets-eur, assets-gbr, assets-us)
      const dynamicsRegex = /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i;
      const currentUrl = tab.url;
      const enabled = message.enabled;

      if (dynamicsRegex.test(currentUrl)) {
        let newUrl = currentUrl;
        const marker = "#d365mkt-nocache";

        if (enabled && !currentUrl.includes(marker)) {
          newUrl = currentUrl + marker;
        } else if (!enabled && currentUrl.includes(marker)) {
          newUrl = currentUrl.replace(marker, "");
        }

        if (newUrl !== currentUrl) {
          chrome.tabs.update(tab.id, { url: newUrl });
        }
      }
    });
  }

});
