# Salary per Second (sps)

A tiny React + TypeScript app that shows how much you’ve earned so far today, updated every second, based on your salary and working hours.

It supports currency selection, monthly/yearly pay input, configurable shift start/end times, a day‑progress gauge, theme switching (system/light/dark), and persistent settings.

## Quick start

Prerequisites:

- Node.js 18+
- pnpm (`npm i -g pnpm`)

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

Lint the project:

```bash
pnpm lint
```

## Features

- Live earnings counter (updates every second)
- Currency selector (common currencies)
- Monthly or yearly pay
- Configurable shift start/end time
- Day progress gauge
- Theme: system, light, dark
- Settings persisted to `localStorage`
- Updates document title with the live formatted amount

## Tech stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 3 (`tailwindcss-animate`), CSS variables for theming
- Radix UI primitives with custom wrappers in `src/components/ui`
- Zustand (with `persist`) for settings storage
- `@number-flow/react` for animated numeric formatting
- `@suyalcinkaya/gauge` for the circular progress gauge
- `lucide-react` icons
- Path aliases via `vite-tsconfig-paths` and `tsconfig` paths (`@/*` → `src/*`)

## Project structure

```
src/
  App.tsx                # Main UI and logic (theme, settings, gauge, counters)
  main.tsx               # App bootstrap
  components/ui/*        # Button, input, sheet, select, etc. (Radix-based)
  stores/settings.ts     # Zustand store (persisted)
  index.css              # Tailwind base + CSS variables for themes
```

## Configuration and behavior

- Theming
  - Dark mode is toggled via the `dark` class on the root element.
  - Preference is stored under `localStorage['theme']` as one of `system | light | dark`.
  - CSS variables are defined in `index.css` and wired in `tailwind.config.js`.

- Settings persistence
  - Stored under `localStorage['sps-settings']` using Zustand `persist`.
  - Defaults: `{ currency: 'USD', period: 'yearly', pay: 120000, shift: 09:00–17:00 }`.

- Currency and formatting
  - Display uses `Intl.NumberFormat` and `@number-flow/react` for smooth updates.

- Path aliases
  - Use imports like `@/components/...` and `@/stores/...`.

## Deployment

This is a static site. Any static host works:

1. Build: `pnpm build` → outputs to `dist/`.
2. Deploy the `dist/` directory to your hosting provider (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

## Scripts

- `pnpm dev` – Start Vite dev server
- `pnpm build` – Type-check then build (`tsc -b && vite build`)
- `pnpm preview` – Preview the production build
- `pnpm lint` – Run ESLint

## License

No license specified.
