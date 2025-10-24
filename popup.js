// popup.js

const highlightToggle = document.getElementById("highlight-toggle");
const nocacheToggle = document.getElementById("nocache-toggle");
const formDetectedCheckbox = document.getElementById("form-detected");
const cacheDisabledCheckbox = document.getElementById("cache-disabled");
const reloadBtn = document.getElementById("reload-btn");

// Initialize toggle states from storage
chrome.storage.local.get(["highlightEnabled", "nocacheEnabled"], (data) => {
  highlightToggle.checked = data.highlightEnabled ?? true;
  nocacheToggle.checked = data.nocacheEnabled ?? false;
  updateOverlayCheckboxes();
});

// Send message to background script when toggles change
highlightToggle.addEventListener("change", () => {
  const enabled = highlightToggle.checked;
  chrome.storage.local.set({ highlightEnabled: enabled });
  chrome.runtime.sendMessage({ type: "TOGGLE_CLASS", className: "d365-highlight" });
  updateOverlayCheckboxes();
});

nocacheToggle.addEventListener("change", () => {
  const enabled = nocacheToggle.checked;
  chrome.storage.local.set({ nocacheEnabled: enabled });
  chrome.runtime.sendMessage({ type: "TOGGLE_NOCACHE", enabled });
  updateOverlayCheckboxes();
});

// Reload button
reloadBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
  });
});

// Update the form detected / cache disabled checkboxes
function updateOverlayCheckboxes() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || "";
    const dynamicsRegex = /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i;

    formDetectedCheckbox.checked = dynamicsRegex.test(url);
    cacheDisabledCheckbox.checked = url.includes("#d365mkt-nocache");
  });
}
