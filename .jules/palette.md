## 2024-05-29 - Accessibility: ARIA roles for custom Tab UI
**Learning:** React components implementing tab navigation using standard \`div\` and \`button\` elements lack screen reader context without proper WAI-ARIA \`role\` attributes (\`tablist\`, \`tab\`, \`tabpanel\`) and \`aria-selected\` states, hindering navigation.
**Action:** Added \`role="tablist"\` to tab containers, \`role="tab"\` and \`aria-selected={isActive}\` to tab buttons.
