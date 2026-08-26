# Haven Horizon — Run Doc

## Reproduce uncommitted artifacts

- The `.env` files in `frontend/` and `backend/` must already exist. They are committed to the repo (not in `.gitignore`). If missing, copy them from the main checkout:
  - `frontend/.env` → copy from main checkout `frontend/.env`
  - `backend/.env` → copy from main checkout `backend/.env`
  - `.env` (root) → copy from main checkout `.env`
- The `uploads/` directory must exist (used by the backend for file storage).

## Install dependencies

```bash
cd "D:\work\haven horizen project"
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

## Run the dev server

```bash
cd "D:\work\haven horizen project"
npm run dev
```

This starts both the backend (Express on port 3001) and the frontend (Vite on port 5173) concurrently.

### Detached on Windows (PowerShell)

Use a .ps1 script to launch npm.cmd:

```powershell
$log = "D:\work\haven horizen project\.freebuff\preview-<id>.log"
$logErr = "$log.err"
$proc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory 'D:\work\haven horizen project' -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Output $proc.Id
```

Or use a .bat file launched via Start-Process cmd.exe:

```bat
@echo off
cd /d "D:\work\haven horizen project"
node node_modules/concurrently/bin/concurrently.js "npm run dev:backend" "npm run dev:frontend"
```

## Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Express) | 3001 |

The Vite dev server proxies `/api` requests to `http://localhost:3001`.

## Sharing via ngrok

1. Install ngrok: `winget install Ngrok.Ngrok` or download from https://ngrok.com/download
2. Configure authtoken: `ngrok config add-authtoken <YOUR_TOKEN>`
3. Start tunnel: `ngrok http 5173`
4. The public URL (e.g., `https://scorecard-cadmium-yesterday.ngrok-free.dev`) can be shared with anyone.
5. Note: The ngrok domain must be added to `frontend/vite.config.ts` under `server.allowedHosts` for Vite to accept it.
