# Admin Graphs UI

Standalone React + Vite dashboard for the SimplifyQA administration graphs.
It signs in with a normal SimplifyQA account and reads the dashboard
microservice's `/dashboard/admin/*` endpoints, so it needs no backend changes.

## Run against QA

```
npm install
npm run dev
```

Open http://localhost:4201 and sign in with a QA SimplifyQA user.

The dev server proxies `/pm` and `/dashboard` to the host in `.env`
(`VITE_API_TARGET`, QA by default) and strips the browser origin, so the
remote CORS allow-list does not matter during development. Change
`VITE_API_TARGET` to point at another environment or at local services.

## Build

```
npm run build
```

Serve `dist/` from the same host that exposes `/pm` and `/dashboard`
(the app calls both with relative URLs).

## Layout

- `src/pages/Login.tsx` – email verification, then password login (`/pm/auth/email`, `/pm/auth/login`)
- `src/pages/AdminGraphs.tsx` – KPI tiles and nine charts
- `src/hooks/useAdminGraph.ts` – one react-query call per graph
- `src/components/ChartCard.tsx` – card with info tooltip, loading, empty, error and table view
- `src/lib/chartPalette.ts` – validated categorical palette for light and dark themes
- `src/components/ui/*` – shadcn primitives (button, card, select, tooltip, table, chart, …)
