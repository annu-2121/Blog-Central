# Pencraft

A full-stack blogging platform where thoughtful writers share ideas and readers engage through comments.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/blog-platform run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Wouter (routing), TanStack Query
- API: Express 5
- Auth: Replit Auth (OpenID Connect / PKCE)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `lib/db/src/schema/` — database schema (`auth.ts`, `posts.ts`, `comments.ts`)
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-zod/` — generated Zod schemas (from codegen)
- `lib/api-hooks/` — generated TanStack Query hooks (from codegen)
- `lib/replit-auth-web/` — shared auth hook for the frontend (`useAuth`)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/blog-platform/src/pages/` — React page components
- `artifacts/blog-platform/src/index.css` — design tokens (Cream/Ink/Sienna palette)

## Architecture decisions

- Contract-first API: OpenAPI spec drives all Zod validation and React Query hooks via codegen.
- Replit Auth handles all identity — no passwords stored; users table populated on first login.
- Sessions use express-session with a signed cookie; `SESSION_SECRET` must be set.
- Posts have published/draft status; only published posts appear on the home feed.
- Comments are always public on published posts; authors can delete their own comments.

## Product

- **Home** (`/`) — editorial hero with live stats (stories, comments, writers), feed of published posts
- **Post detail** (`/posts/:id`) — full post with comments and comment form (login required to comment)
- **Write** (`/write`) — create or edit posts with title, excerpt, content, tags, and publish toggle
- **My Posts** (`/my-posts`) — dashboard showing author's own drafts and published posts with edit/delete

## Design

- Typography: Playfair Display (serif, headings) + Inter (sans, body)
- Palette: Cream `#FAF9F6` · Ink `#171A21` · Burnt Sienna primary
- Sharp edges (`--radius: 0rem`) for an editorial/print feel

## User preferences

_None recorded yet._

## Gotchas

- Always run codegen after editing `lib/api-spec/openapi.yaml`.
- API server imports `zod` directly (not `zod/v4`) due to esbuild resolution.
- The `build` command requires `PORT` and `BASE_PATH` env vars (injected by workflows); use `typecheck` for local verification instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- See the `replit-auth` skill for auth flow details.
