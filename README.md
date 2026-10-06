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

Open http://localhost:4201 and sign in with a QA SimplifyQA user.

The dev server proxies `/pm` and `/dashboard` to the host in `.env`
(`VITE_API_TARGET`, QA by default) and strips the browser origin, so the
remote CORS allow-list does not matter during development. Change
`VITE_API_TARGET` to point at another environment or at local services.

## Super-admin mode on the dashboard service

The dashboard service must (1) accept a token whose `userType` is
`super-admin` (same check as project-management's `superadmin_auth.js`),
(2) read `customerId` from the request body for that token, and (3) allow
`customerId` in `dashboard.validator.js`. Until that is deployed, super-admin
sign-in shows "Not authorised" for the graphs.

`VITE_LM_ENV` in `.env` is the environment name sent to license-management
(`QA`, `UAT` or `PROD`).

## License Management shell clone

`/prototype` is a clone of the License Management (super-admin) shell: header,
sidebar and welcome page. Its **Admin Graphs** section is the same live page as
`/`, so it shows actual data from the configured environment for the selected
customer, and asks you to sign in when there is no session. Customer
Management and Package Builder are placeholders.

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
