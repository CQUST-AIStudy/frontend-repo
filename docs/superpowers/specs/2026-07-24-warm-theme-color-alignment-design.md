# Warm Theme Color Alignment Design

## Goal

Remove visually abrupt blue accents from the frontend and align primary interactions with the current warm `#d18a61` theme, while preserving colors that communicate status or domain meaning.

## Scope

- Replace blue used as a primary accent in buttons, links, navigation states, tabs, focus states, decorative highlights, and single-series charts.
- Route these styles through the existing theme tokens so a user-selected primary color continues to propagate across the application.
- Use `#d18a61` as the current visual reference. Hover, active, soft-background, and focus-ring colors must be derived from the primary token rather than repeated as page-level literals.
- Update multi-series charts that currently rely on a blue-led palette to use a coordinated, distinguishable warm palette. Suitable supporting colors include muted green, gold, restrained red, and neutral violet-gray.

## Color Semantics

- Primary action and selection: `var(--app-primary)` or the matching UI token.
- Strong hover or active state: `var(--app-primary-strong)` or the matching dark UI token.
- Soft selected background: the existing primary tint or soft token.
- Success, warning, and danger retain their existing green, yellow, and red semantic colors.
- Neutral informational content should use the existing neutral info/text tokens unless it is clearly an interactive primary accent.

## Exceptions

- Do not mechanically recolor syntax highlighting or code editor themes.
- Do not recolor diagrams, illustrations, or data series where blue carries distinct domain meaning.
- Do not reduce chart readability by forcing every series to the same orange hue.
- Do not alter layout, typography, component behavior, or backend contracts.

## Implementation Shape

1. Confirm the global theme default and derived variables consistently expose the current primary color.
2. Replace primary-purpose blue literals and blue utility classes with theme-backed tokens.
3. Update shared chart defaults and page-level chart configurations where blue is acting as the main accent.
4. Review remaining blue occurrences individually and retain only semantic or content-specific uses.

## Verification

- The production frontend build completes successfully.
- Primary controls and selected states no longer show an unrelated blue.
- Hover, active, focus, and soft-background states remain visually distinct and accessible.
- Success, warning, and danger states remain recognizable.
- Multi-series charts retain clear series differentiation.
- Representative student and teacher pages are checked for obvious blue accents and visual regressions.
