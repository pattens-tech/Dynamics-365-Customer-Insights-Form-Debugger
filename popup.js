// popup.js — Handles both highlight and no-cache toggles

const highlightCheckbox = document.getElementById("toggleHighlight");
const nocacheCheckbox = document.getElementById("toggleNoCache");

async function init() {
  const data = await chrome.storage.local.get(["highlightEnabled", "nocacheEnabled"]);
  highlightCheckbox.checked = !!data.highlightEnabled;
  nocacheCheckbox.checked = !!data.nocacheEnabled;
}

highlightCheckbox.addEventListener("change", async () => {
  const className = "mylo-extension-highlight";
  chrome.runtime.sendMessage({ type: "TOGGLE_CLASS", className });
  await chrome.storage.local.set({ highlightEnabled: highlightCheckbox.checked });
});

nocacheCheckbox.addEventListener("change", async () => {
  const enabled = nocacheCheckbox.checked;
  await chrome.storage.local.set({ nocacheEnabled: enabled });
  chrome.runtime.sendMessage({ type: "TOGGLE_NOCACHE", enabled });
});

init();
