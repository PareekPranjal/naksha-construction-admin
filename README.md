# naksha-admin

Next.js 14 admin panel for the Naksha CMS backend.

## Setup

```bash
cd admin
npm install
npm run dev   # http://localhost:4001
```

Backend must be running on `http://localhost:4000` (or set `NEXT_PUBLIC_API_URL` in `.env.local`).

## What's here

- **Dashboard** at `/`
- **Collections** (auto-generated CRUD for): projects, services, markets, articles, leaders, jobs, locations, testimonials
- **Pages** at `/pages` — block-based page documents
- **Site** at `/site` — globals (navbar, footer, site settings)
- **Media** at `/media` — Cloudinary-backed library with upload widget
- **Redirects** at `/redirects`
- **Contact** at `/contact` — form submission inbox

No auth gate yet (per spec).
