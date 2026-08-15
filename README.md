# Kristallball — Military Asset Management System

Enterprise-grade system for tracking military assets (vehicles, weapons, ammunition) across multiple bases with real-time inventory calculations, RBAC, and full audit trails.

## Features

- **End-to-End Asset Visibility** — Opening balance, net movement, assignments, expenditures, closing balance
- **Cross-Base Transfers** — Atomic DB transactions with audit logging
- **RBAC** — Admin (global), Base Commander (base-scoped), Logistics Officer (purchases/transfers)
- **Audit Trail** — Every mutation logged centrally
- **Dashboard** — Filterable metrics with net movement breakdown modal and charts

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React (Vite), Tailwind CSS, Lucide React, Recharts, Axios |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + Bcrypt |

## Project Structure

```
milatry-base/
├── backend/          # Express API
│   ├── prisma/       # Schema & seed
│   └── src/          # Controllers, routes, middleware
├── frontend/         # React SPA
│   └── src/          # Pages, components, context
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local, Supabase, Neon, or Render)

### 1. Database Setup

Create a PostgreSQL database and copy environment files:

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 2. Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | Administrator |
| `commander_fort` | `password123` | Base Commander (Fort Liberty) |
| `logistics_officer` | `password123` | Logistics Officer |

## Inventory Formula

```
Net Movement = Purchases + Transfers In − Transfers Out
Closing Balance = Opening Balance + Net Movement − Assigned − Expended
```

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/assets/dashboard` | All roles |
| GET/POST | `/api/purchases` | Logistics+ |
| GET/POST | `/api/transfers` | Logistics+ |
| GET/POST | `/api/operations/assignments` | Commander+ |
| GET/POST | `/api/operations/expenditures` | Commander+ |

## Deployment

- **Backend**: Render / Railway — set `DATABASE_URL`, `JWT_SECRET`, `PORT`
- **Frontend**: Vercel / Netlify — set `VITE_API_BASE_URL` to your API URL

## License

MIT
