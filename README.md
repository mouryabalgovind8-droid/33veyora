# 33veyora (Haven Horizon)

Accommodation & Experiences Discovery & Booking Platform.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 → `frontend/`
- **Backend:** Node.js + Express + TypeScript (JWT auth, Nodemailer, Gemini AI) → `backend/`
- **Database:** PostgreSQL (SQL migrations & seeds) → `database/`

## Project Structure

```
├── frontend/        # React app (pages, components, services)
├── backend/         # Express API (routes, controllers, services)
│   └── src/
│       ├── server.ts        # Entry point
│       ├── routes/          # API endpoints
│       ├── controllers/     # Request handlers
│       ├── services/        # Business logic
│       ├── middleware/      # Auth, security, error handling
│       └── config/          # DB & env config
├── database/
│   ├── migrations/  # 001_initial.sql, 002..., 003...
│   └── seeds/       # Initial data
├── uploads/         # Vendor/user file uploads (served at /uploads)
└── Dockerfile       # Backend production image
```

## Quick Start (Development)

```bash
npm install              # root (concurrently)
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

npm run dev              # backend on :3001 + frontend on :5173
```

Copy `.env.example` → `.env` (root), `backend/.env`, `frontend/.env` and fill values.

## Database Setup

```bash
npm run db:migrate       # runs database/migrations/*.sql
npm run db:seed          # runs database/seeds/*.sql
```

## Production

```bash
npm run build            # builds frontend (vite) + backend (tsc)
npm start                # serves backend dist on :3001
```

Or with Docker: `docker build -t 33veyora-backend .`

## Useful Scripts (root package.json)

| Command | What it does |
|---|---|
| `npm run dev` | Frontend + backend together (concurrently) |
| `npm run build` | Build both apps |
| `npm run lint` | Type-check both apps |
| `npm run db:migrate` / `db:seed` | Setup PostgreSQL schema/data |

