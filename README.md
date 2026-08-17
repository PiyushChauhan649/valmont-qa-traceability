# Valmont Structures QA Traceability — MERN Stack

A ported version of the original TanStack Start + SQLite app, now running on a
classic **MERN** stack:

- **M**ongoDB (via Mongoose) — replaces the `better-sqlite3` file database
- **E**xpress — REST API (replaces TanStack Start server functions)
- **R**eact 19 — same UI/components (shadcn/ui, Tailwind v4, Recharts), now
  routed with `react-router-dom` instead of TanStack Router, and built as a
  plain client-side SPA with Vite instead of an SSR TanStack Start app
- **N**ode.js — runs the Express API

## Project layout

```
mern/
├── client/          Vite + React 19 SPA
│   ├── src/
│   │   ├── components/       AppShell, DocumentUpload, DocumentViewer, ui/ (shadcn)
│   │   ├── pages/             Dashboard, NewRecord, Reports, Documents, Masters, NotFound
│   │   ├── lib/                api.ts (REST client), tracker-schema.ts, tracker-store.ts, master-store.ts, utils.ts
│   │   ├── App.tsx             react-router-dom routes
│   │   └── main.tsx
│   └── vite.config.ts
└── server/          Express + Mongoose API
    ├── src/
    │   ├── models/            MasterRow.js, TraceRecord.js
    │   ├── routes/             masters.js, records.js
    │   ├── lib/                 db.js (connect + seed), seedData.js, masterTables.js
    │   └── index.js             app entrypoint
    └── .env.example
```

## What changed vs. the original app

| Concern | Original (TanStack Start) | MERN version |
|---|---|---|
| Persistence | `better-sqlite3` (`src/lib/db.server.ts`) | MongoDB via Mongoose (`server/src/models`) |
| Data access | `createServerFn` RPCs (`src/lib/server-fns.ts`) | REST endpoints (`server/src/routes`) |
| Client → server calls | Same-process RPC calls | `fetch()` calls in `client/src/lib/api.ts`, same function names/shapes as before so the page components needed almost no logic changes |
| Routing | TanStack Router file-based routes (`src/routes/*.tsx`) | `react-router-dom` (`client/src/pages/*.tsx` + `App.tsx`) |
| Rendering | Server-side rendered (Nitro/Cloudflare target) | Client-side rendered SPA (`vite build` → static files) |
| IDs | UUID strings (unchanged) | UUID strings, used as Mongo `_id` |
| Documents | Stored inline as base64 `dataUrl` on the record (SQLite JSON column) | Stored inline as base64 `dataUrl` on the record (Mongo subdocument array) — same approach, no separate file storage/CDN needed |

The React UI, the "Order Tracker" field schema, the dimensional-checks table,
and the master-data model are all unchanged — only the data layer and routing
were ported.

## Prerequisites

- Node.js 18+
- A MongoDB instance — local (`mongod`) or a connection string from Atlas

## Setup

```bash
cd mern
cp server/.env.example server/.env
# edit server/.env if your MongoDB URI/port differ from the defaults

npm run install:all
```

## Run in development

From the `mern/` root (runs both server and client together):

```bash
npm run dev
```

- API: http://localhost:4000 (health check at `/api/health`)
- App: http://localhost:5173 (Vite dev server proxies `/api/*` to the Express server)

Or run them separately:

```bash
npm run dev:server   # Express API on :4000
npm run dev:client   # Vite dev server on :5173
```

On first boot, the server seeds MongoDB with the same demo master data and
three sample traceability records that shipped with the original app (see
`server/src/lib/seedData.js`).

## Build for production

```bash
npm run build:client        # outputs client/dist (static files)
npm run start:server        # runs the Express API with NODE_ENV=production
```

Serve `client/dist` from any static host (Nginx, Vercel, S3 + CloudFront,
etc.) or add a small `express.static` block to `server/src/index.js` if you'd
rather serve the built client from the same Express process. Point the
client's `VITE_API_BASE_URL` env var at your deployed API URL if it isn't on
the same origin.

## Environment variables

**server/.env**

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Express port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/valmont_qa_traceability` | Mongo connection string |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

**client/.env** (optional)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Override if the API isn't proxied/same-origin |
