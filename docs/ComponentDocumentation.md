# Component Documentation

Milestone 3 adds a shared `@vnbus/ui` design-system package for the Vriddhi Nexus Pvt Ltd bus booking platform. Components follow shadcn-style composition, Radix primitives where appropriate, Tailwind utility styling, dark-mode classes, and accessible labels/states.

## Storybook

Run Storybook from the workspace root:

```bash
pnpm --filter @vnbus/ui storybook
```

Build the static Storybook:

```bash
pnpm --filter @vnbus/ui storybook:build
```

Stories are grouped under `packages/ui/src/stories`:

- `primitives.stories.tsx`: buttons, inputs, password/search input, checkbox, radio, switch, select, textarea, labels, badges, tags, alerts, skeletons, progress, OTP, date/time picker, file upload, image upload.
- `overlays-navigation.stories.tsx`: modal, dialog, drawer, dropdown, popover, tooltip, avatar, breadcrumbs, tabs, accordion, toast trigger, command palette, navigation menu, sidebar, top navigation, footer.
- `data-visuals.stories.tsx`: statistic cards, data table, charts, timeline, status chips, empty/error/success/loading/maintenance states.

## Core Components

Form controls:

- `Button`: variants `default`, `secondary`, `outline`, `ghost`, `destructive`; sizes `sm`, `default`, `lg`, `icon`; supports `loading`.
- `Input`, `PasswordInput`, `SearchInput`, `Textarea`, `Label`.
- `Checkbox`, `RadioGroup`, `Switch`, `Select`, `Autocomplete`.
- `DatePicker`, `Calendar`, `TimePicker`, `OtpInput`.
- `Form` helpers wrap React Hook Form and export `zodResolver` plus shared validation messages.

Feedback and state:

- `Alert`, `ToastProvider`, `useToast`.
- `Badge`, `Tag`, `StatusChip`.
- `Skeleton`, `Progress`.
- `EmptyState`, `ErrorState`, `SuccessState`, `LoadingState`, `MaintenanceState`.

Overlays:

- `Dialog`, `Modal`, `Drawer`.
- `DropdownMenu`, `Popover`, `Tooltip`.
- `CommandPalette`.

Navigation:

- `NavigationMenu`, `Sidebar`, `TopNavigation`, `Footer`.
- `Breadcrumb`, `Tabs`, `Accordion`, `Pagination`.

Data and visualization:

- `DataTable`: supports search, sorting, pagination, column visibility, row selection, loading rows, empty state, and responsive hidden columns.
- `StatisticCard`: metric display with trend and optional icon.
- `AnalyticsChart`: Recharts-backed area, bar, and line charts using dummy data.
- `Timeline`: chronological event list with tone indicators.

## Application Usage

The web app consumes the package across:

- Public landing page and footer.
- Authentication provider wrapping theme and toast providers.
- Dashboard shell with sidebar, top navigation, drawer, notifications, profile menu, and command palette.
- Customer, travel agent, admin, and general dashboard pages.
- Error, loading, session-expired, unauthorized, and maintenance layouts.

Milestone 3 does not add booking persistence or supplier booking functionality.
