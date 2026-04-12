# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BitGlow is a terminal-themed portfolio/agency website for a web development studio. It consists of a static frontend, a PHP API backend (primary, deployed on Hostinger), and a Node.js backend (local dev / alternative hosting).

## Architecture

**Frontend** (`/` root): Static HTML/CSS/JS — no build step. `index.html` is the single-page site; `script.js` handles animations, typing effects, and contact form submission via `fetch`; `styles.css` provides the terminal aesthetic.

**Admin Panel** (`manage-bitglow.html`, `admin.js`, `admin.css`): Protected admin interface for managing bookings and scheduling. Not indexed by search engines. Authenticates via `/api/admin.php`.

**PHP API** (`/api/`) — Primary backend, deployed on Hostinger:
- `admin.php` — Admin panel endpoints (login, booking management)
- `schedule.php` — Public scheduling/booking endpoints
- `auth.php` — JWT authentication middleware
- `db.php` — SQLite database layer
- `config.php` — Server config with credentials (**gitignored — must be uploaded manually after each deploy**)
- `data/bitglow.db` — SQLite database (**gitignored**)

**Node.js Backend** (`/backend/`): Express.js server for local development or non-PHP hosts:
- `server.js` — Main server with contact form, scheduling, and admin routes
- `routes/admin.js`, `routes/schedule.js` — Route handlers
- `middleware/auth.js` — JWT authentication
- `db.js` — SQLite database layer
- `utils/email.js`, `utils/availability.js` — Helpers

**PHP contact fallback** (`/contact.php`, `/contact-smtp.php`): Standalone contact form handlers for simple PHP hosting.

## Deployment (Hostinger)

The site deploys from GitHub to Hostinger. Important: `api/config.php` is gitignored and **will not be included in deploys**. After each deploy, verify it exists on the server or re-upload it via Hostinger File Manager.

`.htaccess` handles security headers, static asset caching, gzip compression, and blocks access to sensitive paths (`/backend/`, `/api/data/`, `.env`, `.log` files).

## Backend Development (Node.js)

```bash
cd backend
cp .env.example .env   # fill in SMTP credentials
npm install
npm run dev            # nodemon with auto-reload
npm start              # production
```

Backend runs on port 3000 (configurable via `PORT` in `.env`).

## Environment Variables

**Node.js** — `backend/.env` (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 3000) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | SMTP credentials |
| `CONTACT_EMAIL` | Recipient for contact form emails |
| `SEND_AUTO_REPLY` | Whether to send auto-reply to submitter |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for admin login |
| `JWT_SECRET` | Secret for signing auth tokens |

**PHP** — `api/config.php` (not in repo, must exist on server):
Contains admin password hash, JWT secret, SMTP settings, scheduling config, and database path.

## Manual Testing

No automated test suite exists. Test the API manually:

```bash
# Health check (Node.js backend)
curl http://localhost:3000/health

# Contact form submission (Node.js backend)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Hello","message":"Test message"}'
```

Serve the frontend locally with `python3 -m http.server 8080` or `npx http-server`.

## Documentation

Additional docs are in `/docs/` and `/backend/`:
- `docs/` — Email setup, PHP deployment, SMTP config, business planning docs
- `backend/README.md` — Node.js backend details
- `backend/HOSTINGER_DEPLOYMENT.md`, `backend/STEP_BY_STEP_HOSTINGER.md` — Deployment guides
