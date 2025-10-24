// content-script.js — Injects highlight style once per page
const STYLE_ID = "mylo-extension-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .mylo-extension-highlight {
      outline: 6px solid rgba(255, 165, 0, 0.6);
      transition: outline 160ms ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

ensureStyle();
