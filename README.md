# Dynamics 365 Form Tester

Temporarily disables **Dynamics 365 Customer Insights Forms** cache, allowing you to rest form changes quickly.

Test, debug, and validate **Dynamics 365 forms** directly in **Microsoft Edge / Chrome**.

---

## Overview

**Pattens – Dynamics 365 Form Tester** is a lightweight browser extension designed for Dynamics 365 Marketing users, developers, and CRM specialists.  
It helps you inspect form behavior, bypass cached data, and toggle testing features with a simple popup interface.

Everything runs **locally** — no data is collected, transmitted, or shared.

---

## Key Features

- ✅ **Instant form testing** for Dynamics 365 Forms  
- 🔄 **Automatic cache bypass** using `#d365mkt-nocache`  
- ⚙️ **Toggle on/off from the Edge toolbar**  
- 🔒 **100% client-side** — no tracking, telemetry, or network calls  

---

## How to Use

1. Install the extension from the Edge Add-ons or Chrome Web Store.  
2. Open a Dynamics 365 form page, such as:  https://assets-gbr.mkt.dynamics.com/XXX
3. Click the **Pattens – Dynamics 365 Form Tester** icon in your browser toolbar.  
4. Toggle **“Disable Cache”** to activate testing mode.  
5. Reload the page to see your form in no-cache state.

All operations happen locally inside your browser session.

---

## Privacy & Data

This extension **does not** collect, transmit, or store any user or form data.  
All functionality (cache toggle, overlay display, and form checks) is performed entirely on your device.

---

# Changelog

## [1.0.1] - 2025-10-24

### Added
- Form detection via `[data-form-id]` attribute for embedded Dynamics 365 forms
- Performance API monitoring to detect form API calls
- Sticky bottom bar UI with form status and cache bypass indicators
- Status badges: Form detection (green/red), Cache disabled (green/red)
- Form metadata display: Full Form ID and field count
- Mutation observer to track dynamically loaded form fields
- Comprehensive console logging with color-coded output
- Support for all URLs (`<all_urls>`) to detect embedded forms on any page
- Reload Form button

### Changed
- Extended content script to run at `document_start` for early detection
- Expanded host permissions to support embedded forms across all domains
- Updated manifest to match all pages instead of just assets URLs

### Technical Details
- Form detection works on both direct asset pages and embedded forms
- Cache bypass via `#d365mkt-nocache` URL hash toggle
- Real-time field count updates via MutationObserver
- CSP-compliant implementation (no eval, no inline scripts)

## Legal Notice

**Dynamics 365** and **Microsoft Edge** are registered trademarks of **Microsoft Corporation**.  
This extension, **Pattens – Dynamics 365 Form Tester**, is an **independent tool** created by **Pattens Tech** and is **not affiliated with, endorsed by, or sponsored by Microsoft Corporation** in any way.  
All references to Microsoft products are used for informational and compatibility purposes only.

---

**Author:** Pattens Tech  
**License:** MIT  
**Version:** 1.0.0
