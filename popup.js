const nocacheToggle = document.getElementById("nocache-toggle");

// Initialize toggle state
chrome.storage.local.get(["nocacheEnabled"], (data) => {
  nocacheToggle.checked = data.nocacheEnabled ?? true; // default enabled
});

// No-cache toggle
nocacheToggle.addEventListener("change", () => {
  const enabled = nocacheToggle.checked;
  chrome.storage.local.set({ nocacheEnabled: enabled });
  chrome.runtime.sendMessage({ type: "TOGGLE_NOCACHE", enabled });
});
