## 2026-05-21 - Generic Button Text in Dynamic Lists
**Learning:** Buttons with generic text like "View Details" or "Source" in a list or grid context are ambiguous for screen reader users who navigate by interactive elements.
**Action:** Always append dynamic context to the `aria-label` (e.g., `aria-label="View details for ${itemName}"`) to make the action specific and distinguishable.
