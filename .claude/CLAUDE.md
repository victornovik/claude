# Build & Test
- `npm run dev` — start frontend dev server
- `npm run build` — TypeScript check + production build
- `npm test` — run tests (Vitest)

# Code Style
- TypeScript strict mode, ES modules (import/export)
- 2-space indentation, single quotes
- Functional React components, no class components

# Architecture
- API routes in `server/src/routes/`
- Database schema in `server/src/db/schema.ts`
- Frontend components in `src/components/`

# Important
- The `--color-purple` CSS variable is actually orange (#FF6B35)
- Auth cookies use sameSite: 'none' for cross-origin