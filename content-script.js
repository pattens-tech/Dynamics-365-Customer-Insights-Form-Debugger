// content-script.js — Overlay with checkboxes and reload button

// Config is loaded from config.js (loaded first in manifest.json)
// Access configuration via the global CONFIG object

const STYLE_ID = CONFIG.ELEMENT_IDS.STYLE;
const OVERLAY_ID = CONFIG.ELEMENT_IDS.OVERLAY;

/**
 * Monitors network requests for Dynamics 365 form API calls using PerformanceObserver.
 * Logs form API detections to console with color-coded output.
 * This is a CSP-compliant alternative to intercepting network requests.
 *
 * @returns {void}
 */
function detectNetworkRequests() {
  const LOG_PREFIX = CONFIG.LOGGING.PREFIX;
  const LOG_STYLE = CONFIG.LOGGING.PREFIX_STYLE;
  
  // Monitor for form API calls via PerformanceObserver if available
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name && entry.name.includes('landingpageforms')) {
            console.log(LOG_PREFIX + ' %cForm API detected via performance:', LOG_STYLE, `color: ${CONFIG.COLORS.INFO};`, entry.name);
          }
        }
      });
      observer.observe({ entryTypes: ['resource'] });
      console.log(LOG_PREFIX + ' %cPerformance observer monitoring enabled', LOG_STYLE, `color: ${CONFIG.COLORS.SUCCESS};`);
    } catch (e) {
      console.log(LOG_PREFIX + ' %cPerformance observer not available:', LOG_STYLE, `color: ${CONFIG.COLORS.NOTICE};`, e.message);
    }
  }
}

/**
 * Scans the DOM for Dynamics 365 form containers and extracts metadata.
 * Looks for elements with [data-form-id] attribute and retrieves form information.
 * Also identifies form-related scripts and cache bypass methods.
 *
 * @returns {Object} Form state object containing detection results and metadata
 * @returns {boolean} return.found - Whether a Dynamics 365 form was detected on the page
 * @returns {string} [return.formId] - The unique form identifier from data-form-id attribute
 * @returns {string} [return.apiUrl] - The form API URL from data-form-api-url attribute
 * @returns {string} [return.cachedUrl] - The cached form URL if available
 * @returns {number} [return.fieldCount] - Number of form fields currently loaded
 * @returns {Array<string>} [return.relatedScripts] - URLs of form-related JavaScript files
 * @returns {Object} [return.cacheBypassMethods] - Object indicating active cache bypass methods
 */
function detectDynamicsForm() {
  const LOG_PREFIX = CONFIG.LOGGING.PREFIX;
  const LOG_STYLE = CONFIG.LOGGING.PREFIX_STYLE;

  console.log(LOG_PREFIX + ' %cScanning page for form...', LOG_STYLE, `color: ${CONFIG.COLORS.WARNING};`);

  let formContainer;
  try {
    formContainer = document.querySelector(CONFIG.SELECTORS.FORM_CONTAINER);
  } catch (e) {
    console.error(LOG_PREFIX + ' %cError querying for form container:', LOG_STYLE, `color: ${CONFIG.COLORS.ERROR};`, e);
    return { found: false, error: e.message };
  }

  if (formContainer) {
    console.log(LOG_PREFIX + ' %c✓ FORM DETECTED', LOG_STYLE, `color: ${CONFIG.COLORS.SUCCESS}; font-size: 14px;`);
    
    const formData = {
      formId: formContainer.getAttribute('data-form-id'),
      apiUrl: formContainer.getAttribute('data-form-api-url'),
      cachedUrl: formContainer.getAttribute('data-cached-form-url')
    };
    
    console.log(LOG_PREFIX + ' %cForm ID:', LOG_STYLE, `color: ${CONFIG.COLORS.INFO};`, formData.formId);
    console.log(LOG_PREFIX + ' %cAPI URL:', LOG_STYLE, `color: ${CONFIG.COLORS.INFO};`, formData.apiUrl);

    // Log all scripts on the page, filtering for form-related ones
    const allScripts = Array.from(document.querySelectorAll(CONFIG.SELECTORS.SCRIPTS)).map(s => s.src);
    const relatedScripts = allScripts.filter(src => 
      src.includes('dynamics') || src.includes('form') || src.includes('mkt') || src.includes('forms')
    );
    
    console.log(LOG_PREFIX + ' %cTotal scripts loaded:', LOG_STYLE, `color: ${CONFIG.COLORS.PURPLE};`, allScripts.length);
    if (relatedScripts.length > 0) {
      console.log(LOG_PREFIX + ' %cRelated scripts:', LOG_STYLE, `color: ${CONFIG.COLORS.PURPLE};`, relatedScripts);
    }

    // Detect cache-busting methods in use
    const url = window.location.href;
    const cacheBypassMethods = {
      urlHash: url.includes(CONFIG.CACHE_BYPASS.URL_HASH),
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

    console.log(LOG_PREFIX + ' %cForm fields detected:', LOG_STYLE, `color: ${CONFIG.COLORS.CYAN};`, formState.fieldCount);
    return formState;
  }

  console.log(LOG_PREFIX + ' %c✗ NO FORM DETECTED', LOG_STYLE, `color: ${CONFIG.COLORS.ERROR}; font-size: 14px;`);
  console.log(LOG_PREFIX + ' %cLooking for: [data-form-id] attribute', LOG_STYLE, `color: ${CONFIG.COLORS.NOTICE};`);
  return { found: false };
}

/**
 * Sets up a MutationObserver to monitor dynamic changes to form fields.
 * Watches for child elements being added to the form container and logs field count updates.
 * Triggers overlay UI updates when the field count changes.
 *
 * Note: Only observes direct children (subtree: false) to avoid performance overhead
 * from monitoring all descendant changes in the form tree.
 *
 * @returns {void}
 */
function monitorFormMutations() {
  const formContainer = document.querySelector(CONFIG.SELECTORS.FORM_CONTAINER);
  const LOG_PREFIX = CONFIG.LOGGING.PREFIX;
  const LOG_STYLE = CONFIG.LOGGING.PREFIX_STYLE;

  if (!formContainer) {
    console.log(LOG_PREFIX + ' %cNo form to monitor for mutations', LOG_STYLE, `color: ${CONFIG.COLORS.NOTICE};`);
    return;
  }

  let lastFieldCount = formContainer.children.length;
  
  const observer = new MutationObserver((mutations) => {
    const currentFieldCount = formContainer.children.length;
    
    // Only log if count actually changed
    if (currentFieldCount !== lastFieldCount) {
      console.log(LOG_PREFIX + ' %cForm fields updated: ' + lastFieldCount + ' → ' + currentFieldCount, LOG_STYLE, `color: ${CONFIG.COLORS.CYAN};`);
      lastFieldCount = currentFieldCount;
      
      // Trigger overlay update
      try {
        const formInfoDiv = document.querySelector('#' + OVERLAY_ID + ' .form-info');
        if (formInfoDiv) {
          const formBadge = document.getElementById(CONFIG.ELEMENT_IDS.FORM_BADGE);
          const cacheBadge = document.getElementById(CONFIG.ELEMENT_IDS.CACHE_BADGE);
          if (formBadge && cacheBadge) {
            updateOverlayStatus(formBadge, cacheBadge, formInfoDiv);
          }
        }
      } catch (e) {
        console.error(LOG_PREFIX + ' %cError updating overlay:', LOG_STYLE, `color: ${CONFIG.COLORS.ERROR};`, e);
      }
    }
  });

  observer.observe(formContainer, { 
    childList: true, 
    subtree: false // Don't observe deep - just direct children
  });

  console.log(LOG_PREFIX + ' %cMutation observer active', LOG_STYLE, `color: ${CONFIG.COLORS.SUCCESS};`);
}

/**
 * Injects CSS styles for the overlay UI into the document head.
 * Creates a style element only if it doesn't already exist.
 * Retries after 100ms if the document head is not yet available.
 *
 * Styles include:
 * - Form highlight effects
 * - Fixed bottom overlay bar
 * - Status badges (active/inactive/neutral states)
 * - Form info display
 * - Reload button
 *
 * @returns {void}
 */
function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  
  // Wait for head to be available
  const head = document.head || document.documentElement;
  if (!head) {
    // Retry later if head isn't ready
    setTimeout(ensureStyle, CONFIG.TIMEOUTS.DOM_RETRY);
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
      z-index: ${CONFIG.STYLES.OVERLAY_Z_INDEX};
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

/**
 * Creates and injects the diagnostic overlay UI at the bottom of the page.
 * The overlay displays form detection status, cache status, form metadata, and a reload button.
 * Only creates the overlay if it doesn't already exist.
 * Retries after 100ms if document.body is not yet available.
 *
 * Components created:
 * - Form detected badge (shows if form is found)
 * - Cache status badge (shows if cache is disabled)
 * - Form info div (displays form ID and field count)
 * - Reload button (triggers page reload)
 *
 * Also sets up a listener for storage changes to update the overlay in real-time.
 *
 * @returns {void}
 */
function ensureOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;

  // Wait for body to be available
  if (!document.body) {
    setTimeout(ensureOverlay, CONFIG.TIMEOUTS.DOM_RETRY);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;

  // Form detected badge
  const formBadge = document.createElement("div");
  formBadge.className = "status-badge neutral";
  formBadge.id = CONFIG.ELEMENT_IDS.FORM_BADGE;
  formBadge.textContent = "○ Form detected";

  // Cache status badge
  const cacheBadge = document.createElement("div");
  cacheBadge.className = "status-badge inactive";
  cacheBadge.id = CONFIG.ELEMENT_IDS.CACHE_BADGE;
  cacheBadge.textContent = "Cache enabled";

  // Form info div
  const formInfoDiv = document.createElement("div");
  formInfoDiv.className = "form-info";
  formInfoDiv.id = CONFIG.ELEMENT_IDS.FORM_INFO;

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
    try {
      const formBadge = document.getElementById(CONFIG.ELEMENT_IDS.FORM_BADGE);
      const cacheBadge = document.getElementById(CONFIG.ELEMENT_IDS.CACHE_BADGE);
      const formInfoDiv = document.getElementById(CONFIG.ELEMENT_IDS.FORM_INFO);
      if (formBadge && cacheBadge && formInfoDiv) {
        updateOverlayStatus(formBadge, cacheBadge, formInfoDiv);
      }
    } catch (e) {
      console.error('[D365 Form Tester] Error in storage change handler:', e);
    }
  });
}

/**
 * Updates the overlay UI elements based on current page state.
 * Checks for cache bypass in URL, detects form presence, and updates all status indicators.
 *
 * @param {HTMLElement} formBadge - The badge element showing form detection status
 * @param {HTMLElement} cacheBadge - The badge element showing cache bypass status
 * @param {HTMLElement} formInfoDiv - The div element displaying form metadata
 * @returns {void}
 */
function updateOverlayStatus(formBadge, cacheBadge, formInfoDiv) {
  const LOG_PREFIX = CONFIG.LOGGING.PREFIX;
  const LOG_STYLE = CONFIG.LOGGING.PREFIX_STYLE;

  // Validate required parameters
  if (!formBadge || !cacheBadge || !formInfoDiv) {
    console.warn(LOG_PREFIX + ' %cMissing required overlay elements', LOG_STYLE, `color: ${CONFIG.COLORS.WARNING};`);
    return;
  }

  const url = window.location.href;
  const hasCacheBypass = url.includes(CONFIG.CACHE_BYPASS.URL_HASH);

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

  console.log(LOG_PREFIX + ' %cStates - Cache: ' + hasCacheBypass + ', Embedded: ' + isEmbeddedForm, LOG_STYLE, `color: ${CONFIG.COLORS.INFO};`);

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
console.log(CONFIG.LOGGING.PREFIX + ' %cExtension loaded!', CONFIG.LOGGING.PREFIX_STYLE, `color: ${CONFIG.COLORS.SUCCESS};`);
detectNetworkRequests();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ensureStyle();
    ensureOverlay();
    console.log(CONFIG.LOGGING.PREFIX + ' %cOverlay and styles initialized', CONFIG.LOGGING.PREFIX_STYLE, `color: ${CONFIG.COLORS.SUCCESS};`);
    monitorFormMutations();
    detectDynamicsForm();
  });
} else {
  ensureStyle();
  ensureOverlay();
  console.log(CONFIG.LOGGING.PREFIX + ' %cOverlay and styles initialized', CONFIG.LOGGING.PREFIX_STYLE, `color: ${CONFIG.COLORS.SUCCESS};`);
  monitorFormMutations();
  detectDynamicsForm();
}
