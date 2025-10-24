# Privacy Policy  
**Pattens – Dynamics 365 Form Tester**

_Last updated: October 2025_

## Introduction  
Pattens – Dynamics 365 Form Tester (“the Extension”) is a browser tool designed to assist Dynamics 365 users in testing and validating marketing forms. This extension is developed and maintained by Pattens Tech.

Your privacy is important to us. This policy explains what information the extension collects, how it is used, and your rights.

## Information Collection and Use  
The Extension **does not collect, store, or transmit** any personal information, browsing data, or analytics to Pattens Tech or any third party.

All operations occur **locally within your browser**. Specifically:
- The extension detects and manipulates form URLs for testing purposes.  
- No data is sent externally or logged remotely.  
- No cookies, tracking, or analytics are used.

## Permissions  
The Extension may request limited browser permissions such as:
- **activeTab** – to interact with the currently open Dynamics 365 Marketing form.  
- **scripting** – to modify URLs or inject test parameters as part of form debugging.

## Extension Permissions and Justification  
**Pattens – Dynamics 365 Form Tester**

| **Permission** | **Why It’s Needed** | **What It Does** |
|-----------------|---------------------|------------------|
| `activeTab` | To apply changes (like toggles or hash appends) on the current webpage. | Only acts when the user activates the extension popup. |
| `scripting` | To inject small scripts that enable highlighting or parameter toggling. | Scripts are local and contain no tracking code. |
| `storage` | To remember toggle states between sessions. | Stored locally in your browser. |
| `host_permissions: <all_urls>` | Required for the toggles to function on Dynamics 365 pages. | The extension does not scan or collect page content. |

---

All permissions are limited to user-triggered actions and operate entirely within the local browser environment.  
No data is transmitted externally, collected, or shared.

These permissions are required solely to provide the testing functionality and are not used for data collection.

## Third-Party Services  
The Extension does not integrate with or share data with any external services, APIs, or analytics providers.

## Data Security  
Since the extension does not process or store data externally, no personal information is retained.  
All activity is executed in your local browser session and ceases when the browser is closed.

## User Responsibility  
It is your responsibility to ensure that form testing is conducted in compliance with your organization’s internal data and IT policies, particularly when working within live or production environments.

## Changes to This Policy  
We may update this Privacy Policy from time to time. Updates will be published on our GitHub repository or Edge Add-ons listing. Continued use of the extension after changes means you accept the updated terms.

## Contact  
If you have any questions or concerns about this Privacy Policy, contact us at:  
**support@pattens.tech**

---

© 2025 Pattens Tech. All rights reserved.
