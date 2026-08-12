# CyberShield AI — Windows setup

Follow these steps top to bottom. Everything is done in PowerShell.

## 1. Install prerequisites (one time)

Install from the official sites:

- **Python 3.12** — https://www.python.org/downloads/
  During install, **tick "Add Python to PATH"**.
- **Node.js LTS** — https://nodejs.org
- **Git** — https://git-scm.com

Then in a **new** PowerShell window:

```powershell
npm install -g pnpm
```

If PowerShell blocks scripts later, run this once (per user, not admin):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 2. Unzip the project

Right-click the `.zip` → **Extract All…** → pick a folder without spaces if you
can (e.g. `C:\Projects\CyberShield`). Spaces work but make paths uglier.

## 3. Create the two `.env` files

Both files are ignored by git, so they're not in the zip — you have to create
them yourself.

### `backend\.env`

Create `<project>\backend\.env` with this content:

```
# Database (Neon Postgres) — replace with your own connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require

# JWT / crypto — generate strong random values for prod, any string works for dev
JWT_SECRET_KEY=change-me-to-a-random-string
JWT_ALGORITHM=HS256
SECRET_KEY=change-me-to-a-random-string

# AI (Groq — get a free key at https://console.groq.com/keys)
APP_AI_BASE_URL=https://api.groq.com/openai/v1
APP_AI_KEY=your-groq-api-key
APP_AI_TEXT_MODEL=llama-3.3-70b-versatile

# Environment
ENVIRONMENT=dev
DEBUG=true

# Server
HOST=0.0.0.0
PORT=8000

# CORS — allow the frontend dev server
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Admin (optional)
ADMIN_USER_ID=admin
ADMIN_USER_EMAIL=admin@example.com

# Logging
LOG_LEVEL=INFO
```

> **You need:**
> - A Neon Postgres URL — free at https://neon.tech
> - A Groq API key — free at https://console.groq.com/keys

### `app\frontend\.env` (optional)

Only needed if the backend runs on something other than `http://localhost:8000`.
Skip this file otherwise; the frontend defaults to localhost:8000 in dev mode.

```
VITE_API_BASE_URL=http://localhost:8000
```

## 4. Backend — install & run

Open PowerShell:

```powershell
cd C:\Projects\CyberShield\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

Leave this window open. You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Verify in a browser: http://localhost:8000/docs

## 5. Frontend — install & run

Open a **second** PowerShell window:

```powershell
cd C:\Projects\CyberShield\app\frontend
pnpm install
pnpm dev
```

Leave this open too. You should see:
```
Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

## Troubleshooting

- **`python not recognized`** — Python wasn't added to PATH during install. Reinstall Python and tick "Add Python to PATH".
- **`Activate.ps1 cannot be loaded because running scripts is disabled`** — run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, in a new PowerShell.
- **Backend starts but crashes with `DATABASE_URL environment variable is required`** — `backend\.env` doesn't exist or is empty. Recreate it (step 3).
- **Chat page shows "Invalid email or password"** — no users exist yet. Go to `/signup` first.
- **Frontend loads but analytics/chat show nothing** — the backend isn't running. Check the first PowerShell window is still up on port 8000.

## What's included

- `backend/` — FastAPI server (Python)
- `app/frontend/` — React + Vite dev app (TypeScript)
- No `node_modules`, no `.venv`, no `.env`, no DB files — all rebuilt on your machine.
