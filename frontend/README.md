# PT Batam Konektra Jaya — Corporate Website

Public corporate website and admin console for PT Batam Konektra Jaya (BKJ),
an industrial engineering company. Built with TanStack Start (React) on the
frontend, with a Laravel + MySQL API to follow.

## Stack

- TanStack Start / TanStack Router (file-based routing, SSR)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui component primitives (Radix UI)

## Development

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — run Prettier

## Project structure

- `src/routes` — file-based pages (public site + `/admin` console)
- `src/components` — shared UI, layout, and admin components
- `src/lib` — service layer (mock data today, backed by a Laravel API later)
