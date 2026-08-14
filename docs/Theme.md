# Theme Documentation

Milestone 3 introduces theme tokens and a UI theme provider in `@vnbus/ui`.

## Provider

The web app wraps its providers with:

```tsx
<ThemeProvider>
  <ToastProvider>{children}</ToastProvider>
</ThemeProvider>
```

`ThemeProvider` stores the selected theme in `localStorage` under `vnbus-theme` and toggles the `dark` class on `document.documentElement`.

Available modes:

- `light`
- `dark`
- `system`

The current web toggle switches between light and dark.

## Tokens

Token exports live in `packages/ui/src/theme/tokens.ts`. The package also exports typography helpers from `packages/ui/src/styles/typography.ts` and motion presets from `packages/ui/src/animations`.

Primary token families:

- Colors: brand blue, neutral gray, success emerald, warning amber, danger red.
- Radius: compact `rounded-md` and `rounded-lg` values.
- Shadows: restrained panel shadows.
- Motion: subtle fade and slide-up transitions through Framer Motion.

## Tailwind

The web app tailwind config includes UI source files:

```ts
"../../packages/ui/src/**/*.{ts,tsx}";
```

Dark mode uses class strategy:

```ts
darkMode: ["class"];
```

Global variables in `apps/web/app/globals.css` define light and dark base color schemes.

## Usage Rules

- Prefer semantic component variants over custom color strings.
- Keep text color paired with appropriate dark-mode classes.
- Do not scale fonts with viewport width.
- Keep letter spacing at normal tracking.
- Use blue for primary actions, not for every surface.
