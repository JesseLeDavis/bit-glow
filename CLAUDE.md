# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BitGlow is a terminal-themed portfolio/agency website for a web development studio. It consists of a static frontend and a Node.js backend for handling contact form submissions via email.

## Architecture

**Frontend** (`/` root): Static HTML/CSS/JS — no build step. `index.html` is the single-page site; `script.js` handles animations, typing effects, and contact form submission via `fetch`; `styles.css` provides the terminal aesthetic.

**Backend** (`/backend`): Express.js server with two endpoints:
- `GET /health` — health check
- `POST /api/contact` — validates input, rate-limits (3 req/15 min/IP), sends email to site owner + auto-reply to user via Nodemailer

**PHP fallback** (`/contact.php`, `/contact-smtp.php`): Alternative backend for hosts without Node.js support.

**`/darren/`**: Separate legacy PHP portfolio — mostly independent from the main site.

## Backend Development

```bash
cd backend
cp .env.example .env   # fill in SMTP credentials
npm install
npm run dev            # nodemon with auto-reload
npm start              # production
```

Backend runs on port 3000 (configurable via `PORT` in `.env`).

## Environment Variables

All required config lives in `backend/.env` (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 3000) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | SMTP credentials |
| `CONTACT_EMAIL` | Recipient for contact form emails |
| `SEND_AUTO_REPLY` | Whether to send auto-reply to submitter |

## Manual Testing

No automated test suite exists. Test the API manually:

```bash
# Health check
curl http://localhost:3000/health

# Contact form submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Hello","message":"Test message"}'
```

Serve the frontend locally with `python3 -m http.server 8080` or `npx http-server`.
