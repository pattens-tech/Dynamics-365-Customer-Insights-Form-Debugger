// content-script.js — Overlay with checkboxes and reload button

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
      padding: 12px 16px;
      font-size: 14px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 220px;
      align-items: flex-start;
    }
    #${OVERLAY_ID} label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }
    #${OVERLAY_ID} button {
      background-color: #262626;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      cursor: pointer;
      transition: background 120ms ease-in-out;
      align-self: flex-start;
    }
    #${OVERLAY_ID} button:hover {
      background-color: #444444;
    }
  `;
  document.head.appendChild(style);
}

// Add overlay
function ensureOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;

  const formDetectedLabel = document.createElement("label");
  const formDetectedCheckbox = document.createElement("input");
  formDetectedCheckbox.type = "checkbox";
  formDetectedCheckbox.disabled = true;
  formDetectedLabel.appendChild(formDetectedCheckbox);
  formDetectedLabel.appendChild(document.createTextNode("Form detected"));

  const cacheDisabledLabel = document.createElement("label");
  const cacheDisabledCheckbox = document.createElement("input");
  cacheDisabledCheckbox.type = "checkbox";
  cacheDisabledCheckbox.disabled = true;
  cacheDisabledLabel.appendChild(cacheDisabledCheckbox);
  cacheDisabledLabel.appendChild(document.createTextNode("Cache disabled"));

  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "Reload Form";
  reloadBtn.addEventListener("click", () => location.reload());

  overlay.appendChild(formDetectedLabel);
  overlay.appendChild(cacheDisabledLabel);
  overlay.appendChild(reloadBtn);
  document.body.appendChild(overlay);

  updateOverlayCheckboxes(formDetectedCheckbox, cacheDisabledCheckbox);

  // Listen for storage changes to update overlay live
  chrome.storage.onChanged.addListener(() => {
    updateOverlayCheckboxes(formDetectedCheckbox, cacheDisabledCheckbox);
  });
}

// Update overlay checkboxes
function updateOverlayCheckboxes(formCheckbox, cacheCheckbox) {
  const dynamicsRegex = /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i;
  const url = window.location.href;

  formCheckbox.checked = dynamicsRegex.test(url);
  cacheCheckbox.checked = url.includes("#d365mkt-nocache");
}

// Initialize
ensureStyle();
ensureOverlay();
