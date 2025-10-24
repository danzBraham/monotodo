# Monotodo

Shared pnpm monorepo that powers a React web app and a reusable UI package. It is intended as a practical starting point for small product teams that want a single codebase for apps, design system primitives, and shared tooling.

## Highlights

- Vite + React 19 with Tailwind CSS 4 for the `apps/web` frontend.
- Reusable component library published internally as `@monotodo/ui`, backed by class-variance-authority and Radix primitives.
- Centralized TypeScript (`@monotodo/typescript-config`) and ESLint (`@monotodo/eslint-config`) presets to keep projects consistent.
- pnpm workspaces with recursive scripts so `pnpm dev`, `pnpm lint`, etc. fan out across every package.

## Repository Layout

```
.
├── apps/
│   └── web/                  # Vite-powered React client that consumes the shared UI kit
├── packages/
│   ├── ui/                   # Design system components, hooks, and Tailwind helpers
│   ├── eslint-config/        # Reusable ESLint flat config variants
│   └── typescript-config/    # Base and React tsconfig presets exported via path aliases
├── pnpm-workspace.yaml       # Declares apps/* and packages/* as workspace members
└── package.json              # Workspace-level scripts (dev, build, lint, format, etc.)
```

## Prerequisites

- Node.js 20 or newer (use the latest LTS release where possible).
- pnpm 9+. Install via `corepack enable` or `npm install -g pnpm`.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run all development servers in parallel (currently just `apps/web`):
   ```bash
   pnpm dev
   ```
   The web client is available at http://localhost:3000 by default.
3. Build every workspace package:
   ```bash
   pnpm build
   ```
4. Type-check and lint across the repo:
   ```bash
   pnpm check-types
   pnpm lint
   ```
5. Format files using the shared Prettier config:
   ```bash
   pnpm format
   # or verify without writing changes
   pnpm format:check
   ```

### Running a Single Package

- `pnpm --filter web dev` starts only the Vite dev server.
- `pnpm --filter @monotodo/ui build` compiles the UI library and validates type declarations.

## Packages

- **`@monotodo/ui`** – Tailwind-ready UI primitives (`Button`, `Input`, etc.) that export both component implementations and utility helpers (for example `@monotodo/ui/lib/utils`). Add new surface areas via `exports` in `packages/ui/package.json`.
- **`@monotodo/eslint-config`** – Flat-config presets split into `./base` (TypeScript without React) and `./base-react`. Extend these from consuming apps to keep linting rules in sync.
- **`@monotodo/typescript-config`** – Canonical `tsconfig` bases (`./base`, `./react`) that other packages reference through `extends`.

## Development Notes

- Tailwind CSS 4 is configured through `components.json` in both the web app and UI package; regenerate tokens there when expanding the design system.
- The UI package currently ships compiled `.js` and `.d.ts` artifacts alongside source for easy local consumption. Run `pnpm --filter @monotodo/ui build` after editing components to refresh outputs.
- React Server Components and data fetching are not yet configured; the template focuses on client-side UX. Add routing/data layers (e.g., TanStack Router, React Query) as needed.

## Adding New Workspaces

1. Create `apps/<name>` or `packages/<name>` and initialize a `package.json` with `"name": "@monotodo/<name>"`.
2. Reference the shared configs:
   ```json
   {
     "scripts": {
       "check-types": "tsc --noEmit",
       "lint": "eslint ."
     },
     "devDependencies": {
       "@monotodo/eslint-config": "workspace:*",
       "@monotodo/typescript-config": "workspace:*"
     }
   }
   ```
3. Add the new package to any relevant aggregate scripts (if it is not automatically picked up by the `pnpm` workspace filters).

## Troubleshooting

- If pnpm cannot resolve the workspace packages, run `pnpm install` from the repo root to refresh the virtual store.
- Vite dev server port conflicts can be resolved with `pnpm --filter web dev -- --port 3000`.
- Delete build artifacts with `pnpm --filter @monotodo/ui clean` when TypeScript output becomes stale.
