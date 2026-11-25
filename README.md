# Bright Financial Solution — Frontend (Phase 1)

React + TypeScript app for the BFS public website and the admin Lead Management System.
The Django backend is built separately; this app talks to it only through the REST contract in
**"BFS Phase 1 — Backend Development Specification"**.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · TanStack Query ·
React Hook Form + Zod · Framer Motion · Lucide icons · Recharts (admin dashboard only)

## Getting started

```bash
cd frontend
npm install
cp .env.example .env.development.local   # already done once
npm run dev                               # http://localhost:5173
```

### Working without the backend (development mock)

With `VITE_USE_MOCK_API=true` in `.env.development.local`, the app runs against an in-browser mock of
the API (`src/lib/mock/server.ts`) using fictitious test data stored in `localStorage`.

- Admin login: `admin` / `admin123` (mock only)
- Reset the mock data: run `localStorage.removeItem('bfs-mock-db')` in the browser console
- The mock reads CSV imports only; XLSX parsing is done by the real backend
- The mock is **never** included in production builds (`import.meta.env.DEV` gate)

### Working with the Django backend

Set `VITE_USE_MOCK_API=false`. In development, Vite proxies `/api` to `http://127.0.0.1:8000`
(override with `VITE_DEV_API_PROXY`), so session cookies and CSRF work on one origin.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API origin in production, e.g. `https://api.example.com`. Empty = same origin. |
| `VITE_USE_MOCK_API` | `true` to use the dev mock (ignored in production builds). |
| `VITE_SITE_URL` | Public site URL for canonical links, Open Graph and `sitemap.xml`. |
| `VITE_CONTACT_PHONE`, `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_EMAIL`, `VITE_BUSINESS_HOURS` | Contact details. Hidden while empty. **Waiting on BFS.** |
| `VITE_SOCIAL_FACEBOOK`, `VITE_SOCIAL_INSTAGRAM`, `VITE_SOCIAL_LINKEDIN` | Social links (optional). |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Generates `sitemap.xml` + `robots.txt`, type-checks, builds to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build locally |

## Structure

```
src/
  config/          site.ts (business info), services.ts (service page content), lenders.ts
  lib/api/         client.ts (fetch, envelope, CSRF, errors), endpoints.ts, types.ts (API contract)
  lib/mock/        dev-only mock API
  lib/             emi.ts, validation.ts (Indian mobile), format.ts (IST dates, INR)
  components/ui/   Button, Field, Modal, Feedback
  components/site/ Header, Footer, EnquiryForm, Seo, page blocks
  pages/public/    Home, About, Services, Service detail, EMI calculator, Contact, Privacy, 404
  admin/           auth, layout, pages: Login, Dashboard, Leads, Lead detail, Employees, Import, Documents
```

## Routes

Public: `/`, `/about`, `/services`, `/services/:slug`, `/emi-calculator`, `/contact`, `/privacy-policy`
Admin: `/admin/login`, `/admin/dashboard`, `/admin/leads`, `/admin/leads/:id`, `/admin/employees`,
`/admin/import`, `/admin/documents`

## Deployment notes

- It is a single-page app: the web server must serve `index.html` for unknown paths (SPA fallback).
- Django admin must not use `/admin/` on the same domain (the backend spec moves it to `/django-admin/`).
- Set `VITE_SITE_URL` and `VITE_API_BASE_URL` before `npm run build`.

## Content still needed from BFS

- Phone, WhatsApp, email, business hours, social links
- Official logo files (a placeholder wordmark is used) and any lender logos they are permitted to show
- Professional photography for the hero and service pages
- Mission and vision wording (omitted until approved)
- Privacy Policy review and approval (current text is a draft)
