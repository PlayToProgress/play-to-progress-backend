# Play to Progress — Backend API

NestJS REST API for the Play to Progress platform. This is **one half of a
two-service architecture** — see the top-level `../README.md` for how it
connects to the frontend, local dev setup, and deployment steps (Render).

Quick start:

```bash
cp .env.example .env   # set MONGODB_URI, generate JWT_SECRET
npm install
npm run seed             # optional demo data
npm run start:dev        # http://localhost:4000
```

## Structure

- `src/schemas/` — Mongoose schemas (one file per entity), registered
  globally via `SchemasModule` so feature modules don't repeat `forFeature`
  wiring
- `src/auth/` — JWT issuing/validation, `@Public()` and `@Roles()`
  decorators, `JwtAuthGuard` + `RolesGuard` (applied globally — every route
  requires auth unless marked `@Public()`, and role checks happen
  server-side regardless of what the frontend UI shows). `RolesGuard` also
  contains the super-admin bypass: a `role: "admin"` user passes every
  `@Roles()` check in the app without needing to be listed explicitly.
- `src/<feature>/` — one module per resource (cohorts, participants,
  attendance, content, projects, badges, checkins, journey-card, surveys,
  showcase, reports, users, partner-orgs), each with its own
  controller/service/DTOs
- `src/gamification/` — Journey Card stamp + badge awarding logic, shared
  by the attendance module
- `src/pdf/` — branded PDF builder used by the reports module

## API base path

Every route is under `/api` (set via `app.setGlobalPrefix('api')` in
`main.ts`) — e.g. `GET /api/cohorts`, `POST /api/auth/login`.


## Bootstrapping the first account

There is no in-app way to create the very first user — every account
creation endpoint requires an already-authenticated admin or coordinator.
The first account (a super admin) is created by `npm run seed`, which writes
directly to MongoDB. From there, log in as that admin and create real
coordinator accounts through the app at `/admin/users` — see the top-level
`../README.md` for the full role/creation-permission table.
# play-to-progress-backend
