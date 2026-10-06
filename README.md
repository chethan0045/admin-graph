# Admin Graphs UI

Standalone React + Vite dashboard for the SimplifyQA administration graphs.
It reads the dashboard microservice's `/dashboard/admin/*` endpoints and offers
two ways to sign in:

- **SimplifyQA user** – no backend change needed. If the email belongs to
  several customers, one session is opened per customer and the header
  dropdown switches between them.
- **Super admin** – license-management login (`/lm/auth/*`), customer list
  from `/lm/customer`, and every graph request carries `customerId`. This
  needs the dashboard service to accept super-admin tokens (see below).

## Run against QA

```
npm install
npm run dev
```

Open http://localhost:4201 — it lands in the License Management shell. Sign in from Admin Graphs with a QA SimplifyQA user, or with the dummy super-admin account below.

The dev server proxies `/pm` and `/dashboard` to the host in `.env`
(`VITE_API_TARGET`, QA by default) and strips the browser origin, so the
remote CORS allow-list does not matter during development. Change
`VITE_API_TARGET` to point at another environment or at local services.

## Dummy super-admin login

Until the dashboard service accepts super-admin tokens, the **Super admin** tab
accepts a dummy account that never calls the backend:

- email `admin@simplify3x.com`, password `12345678`

It shows three dummy customers and renders every graph from the generator in
`src/data/demoGraphs.ts`, with a "Dummy data" badge. Regular SimplifyQA user
sign-in is unaffected and always shows real data.

## Super-admin mode on the dashboard service

The dashboard service must (1) accept a token whose `userType` is
`super-admin` (same check as project-management's `superadmin_auth.js`),
(2) read `customerId` from the request body for that token, and (3) allow
`customerId` in `dashboard.validator.js`. Until that is deployed, super-admin
sign-in shows "Not authorised" for the graphs.

`VITE_LM_ENV` in `.env` is the environment name sent to license-management
(`QA`, `UAT` or `PROD`).

## License Management shell clone

`/super-admin` is a clone of the License Management (super-admin) shell: header,
sidebar and welcome page. Its **Admin Graphs** section shows actual data from the configured environment for the selected
customer, and asks you to sign in when there is no session. Customer
Management and Package Builder are placeholders.

## Build

```
npm run build
```

Serve `dist/` from the same host that exposes `/pm` and `/dashboard`
(the app calls both with relative URLs).

## Layout: one file per graph

Every graph is self-contained in `src/graphs/<Name>.tsx`: it calls its own
dashboard endpoint with `useAdminGraph`, transforms the rows, and renders a
`ChartCard`. It exports a `GraphDefinition` (`id`, `title`, `Card`).
`src/graphs/index.ts` lists the definitions in display order, and
`src/components/AdminGraphsGrid.tsx` renders whatever is in that list.

- Change a graph: edit only its file in `src/graphs/`.
- Add a graph: create `src/graphs/<Name>.tsx`, add its endpoint name to the
  `AdminGraph` union in `src/hooks/useAdminGraph.ts`, add its response shape to
  `src/types/adminGraphs.ts`, and append the definition to `src/graphs/index.ts`.
- Reorder or hide graphs: edit the array in `src/graphs/index.ts`.
- Shared pieces, owned by one person: `ChartCard.tsx`, `charts.tsx`
  (bar, donut, stacked bar, KPI tile, ranking helpers), `chartPalette.ts`,
  `graphs/ProjectSelect.tsx`, `LiveAdminGraphs.tsx` (auth, customer
  dropdown, project list, payload) and the login/auth files.

Each graph receives a `GraphRequest`: the session `token`, the customer's
`projects`, the `base` payload (all project ids and, for super admins, the
customer id) and `scoped(projectId)` for a single-project payload.
