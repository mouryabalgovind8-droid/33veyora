# 🚀 33veyora — Naye PC Pe Setup Guide (Friend ke liye)

Ye project chalane ke liye **2 software** chahiye: **Node.js** aur **PostgreSQL**. Code akele kaafi nahi hai — database me hi saara data (listings, users) rehta hai.

---

## STEP 0 — Software Install (sirf pehli baar)

1. **Node.js (LTS version)** — https://nodejs.org se download karke install karo.
   Check: PowerShell me `node -v` chalao (v18 ya usse upar hona chahiye).
2. **PostgreSQL 16** — https://www.postgresql.org/download/windows/ se install karo.
   ⚠️ Install ke time **`postgres` user ka password** set hoga — **wo yaad rakh lo**, aage chahiye. Baaki sab Next Next default.

---

## STEP 1 — Project unzip karo

Zip ko kahin bhi unzip karo, jaise `C:\Projects\33veyora`

---

## STEP 2 — Database banao + data restore karo

PowerShell kholo (project folder ke andar) aur ye 3 commands chalao —
`<APNA_PASSWORD>` ki jagah apna postgres password dalo:

```powershell
$env:PGPASSWORD='<APNA_PASSWORD>'
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE 33veyora;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d 33veyora -f "database\33veyora-full-backup.sql"
```

Ye backup file **poora data restore** kar degi — admin account, vendor account, saari 10 listings, sab waise ka waisa. ✅

---

## STEP 3 — Apna password `.env` me dalo

`backend\.env` file kholo (Notepad me) → **line 5**:

```
PG_PASSWORD=Pmh81@sun      <-- isko apne postgres ka password se badlo
```

Save karo.

---

## STEP 4 — Install + Chalu karo

Project root folder me PowerShell kholo:

```powershell
npm install
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
npm run dev
```

Pehli baar dependencies install hone me 2-5 minute lagenge. Phir dono server chalu ho jayenge:

- 🌐 **Website:** http://localhost:5173
- 🔧 **Backend health:** http://localhost:3001/api/health → `{"status":"ok"}` dikhna chahiye

Backend start hote hi migrations/seed khud check ho jate hai (kuch karne ki zaroorat nahi).

---

## 🔑 Login Accounts (backup se aaye hue)

| Role | Email | Password |
|---|---|---|
| **Admin** | `33veyoraruyzaki@japan.com` | `AsAlways@japanese.com!23$$` |
| **Vendor** (Himalay stays) | `youknowminee@gmail.com` | *(project owner se pucho)* |

---

## 🛠️ Common Problems

| Error | Solution |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL service band hai → `services.msc` kholo → `postgresql-x64-16` → Start |
| `database "33veyora" does not exist` | STEP 2 skip ho gaya — wapas karo |
| `password authentication failed` | STEP 3 me sahi password dalo |
| `Port 3001/5173 already in use` | Purana node process band karo (Task Manager → node.exe End Task) |
| Photo upload fail | Internet chahiye (photos Cloudinary cloud pe jati hai) |
| `npm install` me error | Node.js LTS version install karo, phir `npm cache clean --force` karke retry |

---

## 📝 Note

- Frontend `:5173` pe aur Backend `:3001` pe chalta hai — dono ek saath `npm run dev` se start hote hai.
- Band karne ke liye terminal me `Ctrl + C`.
