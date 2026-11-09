# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BitGlow is the marketing site for a solo web design studio in Salem, OR, aimed at local small businesses (dark theme; mono/terminal styling only as small accents). It consists of a static frontend and a PHP API backend, deployed on Hostinger.

## Architecture

**Frontend** (`/` root): Static HTML/CSS/JS — no build step. `index.html` is the single-page site; `script.js` handles the dot-grid background, scroll-in, the booking modal and contact form submission via `fetch`; `styles.css` holds the design system. Pricing on the page (build packages, care plans) must match the client contracts.

**Admin Panel** (`manage-bitglow.html`, `admin.js`, `admin.css`): Protected admin interface for managing bookings, scheduling, and care plan clients (Clients tab). Not indexed by search engines. Authenticates via `/api/admin.php`.

**PHP API** (`/api/`) — Backend, deployed on Hostinger:
- `admin.php` — Admin panel endpoints (login, booking management)
- `clients.php` — Client & care plan tracker (clients, support requests with business-hour reply deadlines, time logged against plan allowances). Plan prices/allowances live in `CARE_PLANS` here; tables auto-create on first admin request
- `schedule.php` — Public scheduling/booking endpoints
- `auth.php` — JWT authentication middleware
- `db.php` — SQLite database layer
- `config.php` — Server config with credentials (**gitignored — must be uploaded manually after each deploy**)
- `data/bitglow.db` — SQLite database (**gitignored**)

**PHP contact handlers** (`/contact.php`, `/contact-smtp.php`): Standalone contact form endpoints.

## Deployment (Hostinger)

The site deploys from GitHub to Hostinger. Important: `api/config.php` is gitignored and **will not be included in deploys**. After each deploy, verify it exists on the server or re-upload it via Hostinger File Manager.

`.htaccess` handles security headers, static asset caching, gzip compression, and blocks access to sensitive paths (`/api/data/`, `.env`, `.log` files).

## Environment Variables

**PHP** — `api/config.php` (not in repo, must exist on server):
Contains admin password hash, JWT secret, scheduling config, and database path.

## Manual Testing

No automated test suite exists. Serve the frontend locally with `python3 -m http.server 8080` or `npx http-server`.

## Documentation

Additional docs are in `/docs/`:
- Email setup, PHP deployment, SMTP config, business planning docs
