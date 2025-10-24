// background.js — Edge Manifest V3 service worker
console.log("Service worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    highlightEnabled: true,
    nocacheEnabled: false
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  // Toggle highlight class
  if (message?.type === "TOGGLE_CLASS") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (className) => {
          document.documentElement.classList.toggle(className);
        },
        args: [message.className],
      });
    });
  }

  // Toggle no-cache fragment
  if (message?.type === "TOGGLE_NOCACHE") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) return;

      const dynamicsRegex = /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i;
      const marker = "#d365mkt-nocache";
      let newUrl = tab.url;

      if (dynamicsRegex.test(tab.url)) {
        if (message.enabled && !tab.url.includes(marker)) {
          newUrl = tab.url + marker;
        } else if (!message.enabled && tab.url.includes(marker)) {
          newUrl = tab.url.replace(marker, "");
        }

        if (newUrl !== tab.url) {
          chrome.tabs.update(tab.id, { url: newUrl });
        }
      }
    });
  }
});
