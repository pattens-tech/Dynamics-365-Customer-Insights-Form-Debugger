/**
 * config.js — Central configuration file for the Dynamics 365 Form Debugger extension
 *
 * This file contains all constants, magic numbers, and configuration values used
 * throughout the extension. Centralizing these values makes the code more maintainable
 * and easier to modify.
 */

/**
 * DOM element IDs used throughout the extension
 * @const {Object}
 */
export const ELEMENT_IDS = {
  STYLE: "d365-forms-tester-style",
  OVERLAY: "d365-forms-tester-overlay",
  FORM_BADGE: "form-badge",
  CACHE_BADGE: "cache-badge",
  FORM_INFO: "form-info"
};

/**
 * Timeout values in milliseconds
 * @const {Object}
 */
export const TIMEOUTS = {
  /** Retry delay when waiting for DOM elements to be available */
  DOM_RETRY: 100
};

/**
 * UI styling constants
 * @const {Object}
 */
export const STYLES = {
  /** Z-index for overlay to ensure it appears above all other page content */
  OVERLAY_Z_INDEX: 999999
};

/**
 * Color palette used for console logging and UI elements
 * @const {Object}
 */
export const COLORS = {
  /** Primary brand color (orange) */
  BRAND: "#FF6B35",
  /** Success state (green) */
  SUCCESS: "#4CAF50",
  /** Error/inactive state (red) */
  ERROR: "#F44336",
  /** Info state (blue) */
  INFO: "#2196F3",
  /** Cyan accent */
  CYAN: "#00BCD4",
  /** Purple accent */
  PURPLE: "#9C27B0",
  /** Warning state (amber) */
  WARNING: "#FFC107",
  /** Notice state (orange) */
  NOTICE: "#FF9800"
};

/**
 * Console logging configuration
 * @const {Object}
 */
export const LOGGING = {
  /** Prefix for all console log messages */
  PREFIX: "%c[D365 Form Tester]",
  /** CSS style for the log prefix */
  PREFIX_STYLE: "color: #FF6B35; font-weight: bold;"
};

/**
 * Regular expression patterns
 * @const {Object}
 */
export const PATTERNS = {
  /**
   * Matches Dynamics 365 Marketing form asset URLs
   * Examples: https://assets-gbr.mkt.dynamics.com/...
   *           https://assets-usa.mkt.dynamics.com/...
   */
  DYNAMICS_URL: /^https:\/\/assets-[a-z]{3}\.mkt\.dynamics\.com\//i
};

/**
 * Cache bypass configuration
 * @const {Object}
 */
export const CACHE_BYPASS = {
  /** URL hash used to disable Dynamics 365 form caching */
  URL_HASH: "#d365mkt-nocache"
};

/**
 * Storage keys used in chrome.storage.local
 * @const {Object}
 */
export const STORAGE_KEYS = {
  /** Key for storing the cache bypass enabled/disabled preference */
  NOCACHE_ENABLED: "nocacheEnabled"
};

/**
 * DOM selectors used for form detection
 * @const {Object}
 */
export const SELECTORS = {
  /** Attribute selector for Dynamics 365 form containers */
  FORM_CONTAINER: "[data-form-id]",
  /** All script tags with src attributes */
  SCRIPTS: "script[src]"
};

/**
 * Message types for inter-component communication
 * @const {Object}
 */
export const MESSAGE_TYPES = {
  /** Message sent from popup to background to toggle cache bypass */
  TOGGLE_NOCACHE: "TOGGLE_NOCACHE"
};

/**
 * Default values
 * @const {Object}
 */
export const DEFAULTS = {
  /** Default state for cache bypass (enabled by default) */
  NOCACHE_ENABLED: true
};
