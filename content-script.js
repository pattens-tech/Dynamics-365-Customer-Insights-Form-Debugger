// content-script.js — Overlay for Dynamics 365 Forms Tester

const STYLE_ID = "d365-forms-tester-style";
const OVERLAY_ID = "d365-forms-tester-overlay";

// Inject styles
function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .d365-highlight {
      outline: 6px solid rgba(255, 165, 0, 0.6);
      transition: outline 160ms ease-in-out;
    }
    #${OVERLAY_ID} {
      position: fixed;
      top: 12px;
      right: 12px;
      background: #D2CABD;
      color: #000;
      padding: 10px 16px;
      font-size: 14px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #${OVERLAY_ID} button {
      background-color: #262626;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      cursor: pointer;
      transition: background 120ms ease-in-out;
    }
    #${OVERLAY_ID} button:hover {
      background-color: #444444;
    }
  `;
  document.head.appendChild(style);
}

// Add overlay element
function ensureOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;

  const text = document.createElement("span");
  text.textContent = "Dynamics 365 Forms Tester active on this page";

  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "Reload Form";
  reloadBtn.addEventListener("click", () => location.reload());

  overlay.appendChild(text);
  overlay.appendChild(reloadBtn);
  document.body.appendChild(overlay);
}

// Remove overlay
function removeOverlay() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) overlay.remove();
}

// Initialize
ensureStyle();
ensureOverlay();

// Optionally hide overlay if toggle is off
chrome.storage.local.get(["highlightEnabled", "nocacheEnabled"], (data) => {
  if (!data.highlightEnabled && !data.nocacheEnabled) removeOverlay();
});
