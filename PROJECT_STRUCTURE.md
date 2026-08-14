# Project Structure — Portfolio V5

Owner: **Wahyu Nur Hidayat**

This document maps the architecture after the CMS refactor. The site is a React + Vite SPA backed by Supabase, with a public portfolio and a protected admin dashboard.

## Directory Tree

```
Portofolio_V5/
├── public/                  # Static assets (skill icons, images, robots.txt)
├── src/
│   ├── components/          # Reusable UI (Navbar, Footer, SocialLinks, cards, modals)
│   ├── hooks/
│   │   └── usePortfolioSettings.js   # Fetches singleton CMS row
│   ├── Pages/
│   │   ├── dashboard/       # Admin CRUD pages
│   │   │   ├── Projects.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── Comments.jsx
│   │   │   └── Settings.jsx           # CMS editor (General Settings)
│   │   ├── Home.jsx         # Hero (CMS)
│   │   ├── About.jsx        # About bio (CMS)
│   │   ├── Portofolio.jsx   # Projects, certs, skills tab (skills = CMS)
│   │   ├── Contact.jsx      # Form + social links (CMS)
│   │   ├── Dashboard.jsx    # Admin shell + nested routes
│   │   └── Login.jsx
│   ├── supabase.js          # Supabase client (env: VITE_SUPABASE_*)
│   ├── App.jsx              # Top-level routes
│   └── main.jsx
├── supabase/
│   └── portfolio_settings.sql   # CMS table migration
└── .env                     # Supabase credentials (not committed)
```

## Data Flow

```
Admin Dashboard (/dashboard/settings)
        │ UPDATE portfolio_settings (id=1)
        ▼
   Supabase DB
        │ SELECT (public RLS)
        ▼
usePortfolioSettings() hook
        │
        ├── Home.jsx      → hero_title, hero_subtitle, skills preview, social URLs
        ├── About.jsx     → hero_title, about_text
        ├── Portofolio.jsx → skills_json (Tech Stack tab)
        └── Contact.jsx   → email, github_url, linkedin_url
```

Public pages fetch settings on mount. Changes appear after page reload (no Realtime on settings).

## Supabase Tables

| Table | Purpose | Public access | Admin access |
|---|---|---|---|
| `projects` | Project portfolio items | SELECT | ALL |
| `certificates` | Certificate images | SELECT | ALL |
| `portfolio_comments` | Visitor comments (+ Realtime) | SELECT, INSERT | ALL |
| `profiles` | Auth roles | Own row SELECT | — |
| `portfolio_settings` | Singleton CMS (1 row) | SELECT | UPDATE |

Storage buckets: `project-images`, `certificate-images`, `profile-images`.

## Auth Flow

1. User signs in at `/login` via Supabase Auth.
2. `ProtectedRoute` checks `profiles.role === 'admin'`.
3. Non-admins are redirected to `/login`.
4. Dashboard nested routes render inside `Dashboard.jsx`.

## State Management

- **No global store** — each page uses local `useState` + Supabase calls.
- **CMS data** — centralized in `usePortfolioSettings()` with `DEFAULT_PORTFOLIO_SETTINGS` fallbacks.
- **Projects/certs cache** — `Portofolio.jsx` also uses `localStorage` for faster initial load.

## Adding a New Dynamic Section

1. **Database** — Add column to `portfolio_settings` (or new table) via SQL migration.
2. **RLS** — Public SELECT; admin UPDATE/INSERT as needed.
3. **Hook** — Extend `DEFAULT_PORTFOLIO_SETTINGS` and merge fetched row in `usePortfolioSettings.js`.
4. **Admin** — Add form field(s) in `src/Pages/dashboard/Settings.jsx`.
5. **Public UI** — Consume `settings.new_field` in the relevant page component with loading skeleton.

## Key Routes

| Route | Component | Access |
|---|---|---|
| `/` | App (Home, About, Portfolio, Contact) | Public |
| `/login` | Login | Public |
| `/dashboard/projects` | Projects | Admin |
| `/dashboard/certificates` | Certificates | Admin |
| `/dashboard/comments` | Comments | Admin |
| `/dashboard/settings` | General Settings (CMS) | Admin |
