# NetSpy ITAM

**IT Asset Management** — A lightweight, full-stack network monitoring and hardware telemetry application. Real-time visibility into local network traffic and detailed hardware specifications for managed workstations.

## Features

- **Subnet Discovery** — Automated ping sweep of your local `/24` subnet to discover all active devices
- **MAC Vendor Resolution** — Automatic OUI lookup to resolve hardware manufacturers (uses `netaddr`)
- **Hardware Telemetry Agent** — Deploy on target PCs to collect CPU, RAM, and OS specs
- **Unified Dashboard** — Dark-mode React UI with status indicators, inline editing, and device detail drawers
- **Secure Authentication** — Supabase Auth with JWT-protected API endpoints

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  React Frontend  │───────▶│  FastAPI Backend  │───────▶│    Supabase     │
│  (Vite + TS)     │  JWT   │  (Python)         │ client │  (Postgres+Auth)│
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                    ▲
┌─────────────────┐                 │ POST /api/telemetry
│  Agent Script    │─────────────────┘
│  (Python psutil) │
└─────────────────┘
```

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS v4, TanStack Query |
| Backend | Python, FastAPI, Supabase Python Client |
| Database & Auth | Supabase (PostgreSQL) |
| Telemetry Agent | Python, psutil |
| OUI Lookup | netaddr |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **Supabase** account ([supabase.com](https://supabase.com))

### 1. Supabase Setup

Create a project at [supabase.com](https://supabase.com), then run the contents of `supabase/schema.sql` in the **SQL Editor**.

From your Supabase dashboard (Settings → API), copy:
- Project URL
- `anon` (public) key
- `service_role` (secret) key
- JWT Secret

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your Supabase credentials
python run.py          # starts at http://localhost:8000
```

API docs available at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev            # starts at http://localhost:5173
```

### 4. Telemetry Agent (run on target PCs)

```bash
cd agent
pip install -r requirements.txt
# Edit config.ini with your backend URL and API key
python agent.py            # one-shot telemetry send
python agent.py --daemon   # background mode (sends every 30 min)
```

### 5. Create an Admin User

Register via the API:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Or create a user directly in the Supabase dashboard under **Authentication → Users**.

## Project Structure

```
netspy-itam/
├── backend/                 # FastAPI server
│   ├── app/
│   │   ├── api/             # Route handlers (auth, devices, scanner, telemetry)
│   │   ├── core/            # Config, Supabase client, JWT security
│   │   └── services/        # Scanner logic, OUI lookup
│   ├── requirements.txt
│   └── run.py
├── frontend/                # React + Vite dashboard
│   ├── src/
│   │   ├── components/      # UI components (auth, devices, layout, scanner)
│   │   ├── hooks/           # useAuth, useDevices (TanStack Query)
│   │   ├── lib/             # Supabase client, API fetch wrapper
│   │   └── types/           # TypeScript interfaces
│   └── package.json
├── agent/                   # Standalone telemetry collector
│   ├── agent.py
│   └── config.ini
└── supabase/
    └── schema.sql           # Database DDL for Supabase SQL Editor
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register a new user |
| `POST` | `/api/auth/login` | None | Login, returns JWT |
| `GET` | `/api/auth/me` | JWT | Get current user info |
| `GET` | `/api/devices` | JWT | List all devices |
| `PATCH` | `/api/devices/{mac}` | JWT | Update device name |
| `POST` | `/api/scan` | JWT | Trigger network sweep |
| `POST` | `/api/telemetry` | API Key | Agent telemetry check-in |

## License

MIT
