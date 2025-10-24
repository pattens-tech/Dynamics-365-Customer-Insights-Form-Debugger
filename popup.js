// popup.js — Handles toggle logic from popup
const checkbox = document.getElementById("toggle");

async function init() {
  const data = await chrome.storage.local.get("enabledByDefault");
  checkbox.checked = !!data.enabledByDefault;
}

checkbox.addEventListener("change", async () => {
  const className = "mylo-extension-highlight";
  chrome.runtime.sendMessage({ type: "TOGGLE_CLASS", className });
  await chrome.storage.local.set({ enabledByDefault: checkbox.checked });
});

init();
