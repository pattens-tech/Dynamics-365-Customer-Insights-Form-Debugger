// background.js — append #d365mkt-nocache only for Dynamics 365 form URLs

const dynamicsRegex = /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i;

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && dynamicsRegex.test(changeInfo.url)) {
    applyNoCache(tabId, changeInfo.url);
  }
});

// Listen for messages from popup toggle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_NOCACHE") {
    if (sender.tab && dynamicsRegex.test(sender.tab.url)) {
      applyNoCache(sender.tab.id, sender.tab.url, message.enabled);
    }
  }
});

// Apply or remove #d365mkt-nocache
function applyNoCache(tabId, url, forceEnabled = null) {
  chrome.storage.local.get(["nocacheEnabled"], (data) => {
    const enabled = forceEnabled !== null ? forceEnabled : (data.nocacheEnabled ?? true);

    let newUrl = url;

    // Only append if not already present
    if (enabled && !url.includes("#d365mkt-nocache")) {
      newUrl = url + "#d365mkt-nocache";
    } else if (!enabled && url.includes("#d365mkt-nocache")) {
      newUrl = url.replace("#d365mkt-nocache", "");
    }

    if (newUrl !== url) {
      chrome.tabs.update(tabId, { url: newUrl });
    }
  });
}
