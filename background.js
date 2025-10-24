// background.js — Handles toggling highlight + Dynamics no-cache URL logic

console.log("Service worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    highlightEnabled: true,
    nocacheEnabled: false
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
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

  if (message?.type === "TOGGLE_NOCACHE") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab?.url) return;

      const dynamicsPrefix = "https://assets-eur.mkt.dynamics.com/";
      const currentUrl = tab.url;
      const enabled = message.enabled;

      if (currentUrl.startsWith(dynamicsPrefix)) {
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
