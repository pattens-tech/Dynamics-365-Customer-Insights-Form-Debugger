// content-script.js — Overlay with checkboxes and reload button

const STYLE_ID = "d365-forms-tester-style";
const OVERLAY_ID = "d365-forms-tester-overlay";

// Check for Dynamics form in Network tab (limited but CSP-compliant)
function detectNetworkRequests() {
  const LOG_PREFIX = '%c[D365 Form Tester]';
  const LOG_STYLE = 'color: #FF6B35; font-weight: bold;';
  
  // Monitor for form API calls via PerformanceObserver if available
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name && entry.name.includes('landingpageforms')) {
            console.log(LOG_PREFIX + ' %cForm API detected via performance:', LOG_STYLE, 'color: #2196F3;', entry.name);
          }
        }
      });
      observer.observe({ entryTypes: ['resource'] });
      console.log(LOG_PREFIX + ' %cPerformance observer monitoring enabled', LOG_STYLE, 'color: #4CAF50;');
    } catch (e) {
      console.log(LOG_PREFIX + ' %cPerformance observer not available', LOG_STYLE, 'color: #FF9800;');
    }
  }
}

// Detect Dynamics 365 form container and log scripts
function detectDynamicsForm() {
  const LOG_PREFIX = '%c[D365 Form Tester]';
  const LOG_STYLE = 'color: #FF6B35; font-weight: bold;';
  
  console.log(LOG_PREFIX + ' %cScanning page for form...', LOG_STYLE, 'color: #FFC107;');
  
  const formContainer = document.querySelector('[data-form-id]');
  
  if (formContainer) {
    console.log(LOG_PREFIX + ' %c✓ FORM DETECTED', LOG_STYLE, 'color: #4CAF50; font-size: 14px;');
    
    const formData = {
      formId: formContainer.getAttribute('data-form-id'),
      apiUrl: formContainer.getAttribute('data-form-api-url'),
      cachedUrl: formContainer.getAttribute('data-cached-form-url')
    };
    
    console.log(LOG_PREFIX + ' %cForm ID:', LOG_STYLE, 'color: #2196F3;', formData.formId);
    console.log(LOG_PREFIX + ' %cAPI URL:', LOG_STYLE, 'color: #2196F3;', formData.apiUrl);

    // Log all scripts on the page, filtering for form-related ones
    const allScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const relatedScripts = allScripts.filter(src => 
      src.includes('dynamics') || src.includes('form') || src.includes('mkt') || src.includes('forms')
    );
    
    console.log(LOG_PREFIX + ' %cTotal scripts loaded:', LOG_STYLE, 'color: #9C27B0;', allScripts.length);
    if (relatedScripts.length > 0) {
      console.log(LOG_PREFIX + ' %cRelated scripts:', LOG_STYLE, 'color: #9C27B0;', relatedScripts);
    }

    // Detect cache-busting methods in use
    const url = window.location.href;
    const cacheBypassMethods = {
      urlHash: url.includes('#d365mkt-nocache'),
      apiParameter: false
    };

    const formState = {
      found: true,
      implementation: 'dynamic',
      ...formData,
      relatedScripts,
      cacheBypassMethods,
      fieldsLoaded: formContainer.children.length > 0,
      fieldCount: formContainer.children.length,
      allScripts: allScripts.length
    };

    console.log(LOG_PREFIX + ' %cForm fields detected:', LOG_STYLE, 'color: #00BCD4;', formState.fieldCount);
    return formState;
  }
  
  console.log(LOG_PREFIX + ' %c✗ NO FORM DETECTED', LOG_STYLE, 'color: #F44336; font-size: 14px;');
  console.log(LOG_PREFIX + ' %cLooking for: [data-form-id] attribute', LOG_STYLE, 'color: #FF9800;');
  return { found: false };
}



// Monitor when form fields are added dynamically
function monitorFormMutations() {
  const formContainer = document.querySelector('[data-form-id]');
  const LOG_PREFIX = '%c[D365 Form Tester]';
  const LOG_STYLE = 'color: #FF6B35; font-weight: bold;';
  
  if (!formContainer) {
    console.log(LOG_PREFIX + ' %cNo form to monitor for mutations', LOG_STYLE, 'color: #FF9800;');
    return;
  }

  let lastFieldCount = formContainer.children.length;
  
  const observer = new MutationObserver((mutations) => {
    const currentFieldCount = formContainer.children.length;
    
    // Only log if count actually changed
    if (currentFieldCount !== lastFieldCount) {
      console.log(LOG_PREFIX + ' %cForm fields updated: ' + lastFieldCount + ' → ' + currentFieldCount, LOG_STYLE, 'color: #00BCD4;');
      lastFieldCount = currentFieldCount;
      
      // Trigger overlay update
      const formInfoDiv = document.querySelector('#' + OVERLAY_ID + ' .form-info');
      if (formInfoDiv) {
        const cacheCheckbox = document.querySelector('#' + OVERLAY_ID + ' input[type="checkbox"]:nth-of-type(1)');
        const embeddedCheckbox = document.querySelector('#' + OVERLAY_ID + ' input[type="checkbox"]:nth-of-type(2)');
        updateOverlayCheckboxes(cacheCheckbox, embeddedCheckbox, formInfoDiv);
      }
    }
  });

  observer.observe(formContainer, { 
    childList: true, 
    subtree: false // Don't observe deep - just direct children
  });
  
  console.log(LOG_PREFIX + ' %cMutation observer active', LOG_STYLE, 'color: #4CAF50;');
}

// Inject styles
function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  
  // Wait for head to be available
  const head = document.head || document.documentElement;
  if (!head) {
    // Retry later if head isn't ready
    setTimeout(ensureStyle, 100);
    return;
  }
  
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .d365-highlight {
      outline: 6px solid rgba(255, 165, 0, 0.6);
      transition: outline 160ms ease-in-out;
    }
    #${OVERLAY_ID} {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      color: #000;
      padding: 12px 16px;
      font-size: 14px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.15);
      z-index: 999999;
      pointer-events: auto;
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      border-top: 2px solid #f0f0f0;
    }
    #${OVERLAY_ID} .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    #${OVERLAY_ID} .status-badge.active {
      background-color: #4CAF50;
      color: #fff;
    }
    #${OVERLAY_ID} .status-badge.inactive {
      background-color: #f44336;
      color: #fff;
    }
    #${OVERLAY_ID} .status-badge.neutral {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }
    #${OVERLAY_ID} .form-info {
      font-size: 11px;
      color: #666;
      font-family: monospace;
      word-break: break-all;
      flex: 1;
      min-width: 200px;
    }
    #${OVERLAY_ID} button {
      background-color: #262626;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-family: "Firesans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      cursor: pointer;
      transition: background 120ms ease-in-out;
    }
    #${OVERLAY_ID} button:hover {
      background-color: #444444;
    }
  `;
  head.appendChild(style);
}

// Add overlay
function ensureOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  
  // Wait for body to be available
  if (!document.body) {
    setTimeout(ensureOverlay, 100);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;

  // Form detected badge
  const formBadge = document.createElement("div");
  formBadge.className = "status-badge neutral";
  formBadge.id = "form-badge";
  formBadge.textContent = "○ Form detected";

  // Cache status badge
  const cacheBadge = document.createElement("div");
  cacheBadge.className = "status-badge inactive";
  cacheBadge.id = "cache-badge";
  cacheBadge.textContent = "Cache enabled";

  // Form info div
  const formInfoDiv = document.createElement("div");
  formInfoDiv.className = "form-info";
  formInfoDiv.id = "form-info";

  // Reload button
  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "Reload";
  reloadBtn.addEventListener("click", () => location.reload());

  overlay.appendChild(formBadge);
  overlay.appendChild(cacheBadge);
  overlay.appendChild(formInfoDiv);
  overlay.appendChild(reloadBtn);
  document.body.appendChild(overlay);

  updateOverlayStatus(formBadge, cacheBadge, formInfoDiv);

  // Listen for storage changes to update overlay live
  chrome.storage.onChanged.addListener(() => {
    const formBadge = document.getElementById("form-badge");
    const cacheBadge = document.getElementById("cache-badge");
    const formInfoDiv = document.getElementById("form-info");
    updateOverlayStatus(formBadge, cacheBadge, formInfoDiv);
  });
}

// Update overlay status badges and form info
function updateOverlayStatus(formBadge, cacheBadge, formInfoDiv) {
  const LOG_PREFIX = '%c[D365 Form Tester]';
  const LOG_STYLE = 'color: #FF6B35; font-weight: bold;';
  
  const url = window.location.href;
  const hasCacheBypass = url.includes("#d365mkt-nocache");
  
  // Check if form is embedded on this page
  const formState = detectDynamicsForm();
  const isEmbeddedForm = formState.found;
  
  // Update form badge
  if (formBadge) {
    if (isEmbeddedForm) {
      formBadge.className = "status-badge active";
      formBadge.textContent = "✓ Form detected";
    } else {
      formBadge.className = "status-badge inactive";
      formBadge.textContent = "✗ Form not detected";
    }
  }
  
  // Update cache badge
  if (cacheBadge) {
    if (hasCacheBypass) {
      cacheBadge.className = "status-badge active";
      cacheBadge.textContent = "✓ Cache disabled";
    } else {
      cacheBadge.className = "status-badge inactive";
      cacheBadge.textContent = "Cache enabled";
    }
  }

  console.log(LOG_PREFIX + ' %cStates - Cache: ' + hasCacheBypass + ', Embedded: ' + isEmbeddedForm, LOG_STYLE, 'color: #2196F3;');

  // Display form info
  const stats = window.__d365FormTesterStats || {};
  
  if (formState.found) {
    formInfoDiv.innerHTML = `
      ID: ${formState.formId} | 
      Fields: ${formState.fieldCount}
    `;
  } else {
    formInfoDiv.innerHTML = '';
  }
}

// Initialize - wait for DOM to be ready
console.log('%c[D365 Form Tester] %cExtension loaded!', 'color: #FF6B35; font-weight: bold;', 'color: #4CAF50;');
detectNetworkRequests();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ensureStyle();
    ensureOverlay();
    console.log('%c[D365 Form Tester] %cOverlay and styles initialized', 'color: #FF6B35; font-weight: bold;', 'color: #4CAF50;');
    monitorFormMutations();
    detectDynamicsForm();
  });
} else {
  ensureStyle();
  ensureOverlay();
  console.log('%c[D365 Form Tester] %cOverlay and styles initialized', 'color: #FF6B35; font-weight: bold;', 'color: #4CAF50;');
  monitorFormMutations();
  detectDynamicsForm();
}
