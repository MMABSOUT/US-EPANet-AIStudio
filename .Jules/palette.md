## 2025-05-18 - Modal Dialog Accessibility and Keyboard Dismissal
**Learning:** Modal components in this app lacked semantic dialog roles, aria-modal, aria-labelledby, and keyboard event listeners for the standard Escape key, creating a keyboard trap where users were forced to click the small 'X' or 'Got it' buttons.
**Action:** Always ensure modal overlays implement `role="dialog"`, `aria-modal="true"`, heading association (`aria-labelledby`), an `aria-label` on close icon buttons, and an `Escape` key event listener for quick keyboard dismissal.
