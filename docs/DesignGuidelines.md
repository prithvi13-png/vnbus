# Design Guidelines

The Vriddhi Nexus UI is designed for transport operations: fast scanning, repeated workflows, and clear role boundaries.

## Principles

1. Prefer calm operational density over marketing-heavy screens inside dashboards.
2. Use shared components from `@vnbus/ui` before adding page-local UI.
3. Keep repeated records in tables, timelines, badges, and compact cards.
4. Use icons from `lucide-react` for buttons and navigation.
5. Keep cards for repeated items, panels, modals, and framed tools. Avoid cards inside cards.
6. Avoid glassmorphism, neomorphism, decorative blobs, and one-note palettes.
7. Keep copy concrete and role-specific: customer, travel agent, admin, or operations.

## Layout Rhythm

- Page max width: `max-w-7xl`.
- Dashboard content padding: `px-4 sm:px-6 lg:px-8`, `py-6`.
- Cards use `rounded-lg`, light borders, and subtle shadow from the UI package.
- Section headings use compact typography inside dashboards and larger type only on public landing sections.
- Fixed-format elements such as sidebars, icon buttons, tables, and charts use stable dimensions to avoid layout shift.

## Color

Primary actions use blue. Supporting tones:

- Success: emerald for confirmed/healthy states.
- Warning: amber for review, retry, or pending attention.
- Danger: red for blocked/error states.
- Neutral: gray for metadata and default state.

Dark mode is first-class. Every shared component includes `dark:` classes for background, border, text, and interactive states.

## Interaction

- Use `Button` for commands and `Link` for navigation.
- Use icon-only buttons only when `aria-label` is present.
- Use `CommandPalette` for cross-dashboard navigation.
- Use `ToastProvider` for transient feedback.
- Use `Drawer` for mobile navigation.
- Use `DataTable` for operational records instead of ad hoc tables.

## Accessibility

- Inputs must have labels or accessible names.
- Icon-only controls require `aria-label`.
- Dialog, modal, drawer, dropdown, popover, tooltip, select, tabs, accordion, checkbox, radio, switch, toast, and progress are backed by Radix primitives where applicable.
- Loading, empty, error, success, and maintenance states use explicit titles and descriptions.
