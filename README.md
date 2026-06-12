# GestioPro

Business management application (customers, products, quotations, invoices, contracts) for **freelancers and self-employed professionals**, built with **ASP.NET Core 10**, **Entity Framework Core**, and a **TypeScript/Vite** frontend. Available as both a **web app** and a **desktop app** (via Electron).

---

## Project Structure

```bash
GestioPro/
├── GestioPro.slnx              ← Solution file (open with VS 2022 17.13+ or dotnet CLI)
│
├── GestioPro.Common/           ← Shared layer (Models, DTOs, Interfaces, Enums, Exceptions)
├── GestioPro.Infrastructure/   ← Data layer (AppDbContext, Services with EF Core + LINQ)
├── GestioPro.Api/              ← Web API layer (Controllers, Program.cs, DI registration)
│   ├── icon.ico                ← Application icon
│   └── appsettings.json        ← Connection string, JWT config
│
└── frontend/                   ← TypeScript + Vite frontend (web + Electron desktop)
    ├── electron/               → Electron main process (main.js)
    ├── src/                    → .ts source files (api, store, app logic)
    ├── *.html                  → HTML pages
    ├── css/                    → Stylesheets (theme.css supports dark mode)
    ├── public/                 → Static assets (icon.svg)
    ├── vite.config.ts          → Dev server (port 3000, proxies /api to backend)
    └── package.json
```

**Dependency direction:** `Api` → `Infrastructure` → `Common`

---

## Prerequisites

| Tool | Version | Download |
|---|---|---|
| .NET SDK | 10.0+ | https://dotnet.microsoft.com/download |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Docker *(optional)* | any | https://www.docker.com |

---

## 1. Database Setup

### Option A — Docker (recommended for development)

```bash
docker-compose up -d
```

This starts PostgreSQL on port **5332** with:

- Database: `gestiopro`
- Username: `sa`
- Password: `Pa55w0rd`

### Option B — Local PostgreSQL

Create the database manually:

```sql
CREATE DATABASE gestiopro;
CREATE USER sa WITH PASSWORD 'Pa55w0rd';
GRANT ALL PRIVILEGES ON DATABASE gestiopro TO sa;
```

Then update the connection string in `GestioPro.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=gestiopro;Username=sa;Password=Pa55w0rd"
}
```

---

## 2. Run the Backend (API)

```bash
cd GestioPro.Api
dotnet run
```

The API will be available at:

- HTTPS: https://localhost:7160
- Swagger: https://localhost:7160/swagger/index.html

```bash
# Build the full solution
dotnet build GestioPro.slnx
```

### EF Core Migrations

```bash
# Add a new migration
dotnet ef migrations add InitialCreate --project GestioPro.Infrastructure --startup-project GestioPro.Api

# Apply migrations to the database
dotnet ef database update --project GestioPro.Infrastructure --startup-project GestioPro.Api

# Drop the database (if needed)
dotnet ef database drop --project GestioPro.Infrastructure --startup-project GestioPro.Api
```

### First-time user setup

There is no default user. Use the **Register** form on the login page to create your account, or call the API directly:

```bash
curl -X POST https://localhost:7160/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario","surname":"Rossi","username":"admin","email":"admin@example.com","password":"secret"}'
```

---

## 3. Run the Frontend

```bash
cd frontend
npm install       # first time only
```

### Web version

```bash
npm run dev       # Vite dev server → http://localhost:3000
npm run build     # production build → frontend/dist/
```

All `/api` calls are proxied to `https://localhost:7160` automatically — no CORS issues in development.

### Desktop version (Electron)

```bash
npm run electron:dev    # starts Vite + Electron together (backend must be running separately)
```

The Electron window opens automatically once the Vite dev server is ready. The backend still needs to be started manually in development (same as the web version).

---

## 4. Full Stack — Start Everything

### Web

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd GestioPro.Api && dotnet run

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000** in your browser.

### Desktop

```bash
# Terminal 1 — Backend
cd GestioPro.Api && dotnet run

# Terminal 2 — Electron
cd frontend && npm run electron:dev
```

The desktop window opens automatically.

---

## 5. Build for Distribution (Desktop)

First, publish the backend as a self-contained executable:

```bash
dotnet publish GestioPro.Api -c Release -r win-x64 --self-contained -o GestioPro.Api/bin/Release/net10.0/win-x64/publish
```

Then build and package the Electron app:

```bash
cd frontend
npm run electron:build   # output in frontend/dist-electron/
```

This produces a Windows installer (`.exe`) in `frontend/dist-electron/`. The packaged app starts the backend automatically — no separate terminal needed.

---

## 6. Authentication

Authentication uses **JWT Bearer tokens**.

- `POST /api/v1/auth/register` — create a new account
- `POST /api/v1/auth/login` — returns `{ token, user }`

The token is stored in `localStorage` and sent automatically with every API call via `Authorization: Bearer <token>`. All protected endpoints require a valid token.

---

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login, returns JWT token |
| POST | `/api/v1/auth/register` | Register new account |
| GET | `/api/v1/users/me` | Get current user (auth required) |
| GET | `/api/v1/customers` | List all customers |
| POST | `/api/v1/customers` | Create customer |
| PUT | `/api/v1/customers/{id}` | Update customer |
| DELETE | `/api/v1/customers/{id}` | Delete customer |
| GET | `/api/v1/products` | List all products |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |
| GET | `/api/v1/product-categories` | List product categories |
| GET | `/api/v1/quotations` | List all quotations |
| POST | `/api/v1/quotations` | Create quotation |
| GET | `/api/v1/settings` | Get settings |
| PUT | `/api/v1/settings` | Update settings |

---

## 8. Dark Mode

The app supports light and dark mode. The toggle button is in the top bar on every page. The preference is saved in `localStorage` and applied immediately on page load (no flash).

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL 15 |
| Auth | JWT Bearer (System.IdentityModel.Tokens.Jwt) |
| Frontend | TypeScript + Vite |
| Desktop | Electron |
| Containerization | Docker Compose |
