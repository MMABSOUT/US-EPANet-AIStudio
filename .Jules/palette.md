# Palette's Journal - EPANET Web

This journal records critical UX/accessibility learnings for EPANET Web.

## 2026-10-31 - Accessible Icon Buttons in Floating Map Toolbars
**Learning:** Floating toolbar icon buttons that lack `aria-label` prevent screen reader users from identifying canvas tools, and omitting `focus-visible` rings makes keyboard-only tab navigation invisible against dark canvas backgrounds.
**Action:** Always provide explicit, descriptive `aria-label`s on icon-only toolbar controls and combine them with `outline-none focus-visible:ring-2` matched with the component's accent color palette.
