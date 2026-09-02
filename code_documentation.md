# GestioPro — Technical Documentation

High-level overview of the project's architecture, meant as a quick orientation guide to the codebase.

## What it is

GestioPro is a business management application (customers, quotations, contracts, products, audit log) distributed as:

- **Windows desktop app** (Electron), the primary use case — runs in the background with a tray icon and starts automatically on PC boot.
- **Web app** — the same frontend can also be served over a browser, pointing at the same backend.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Desktop shell | Electron |
| Backend | ASP.NET Core Web API (.NET, C#) |
| ORM | Entity Framework Core (code-first, migrations) |
| Database | PostgreSQL (local in development, Supabase in production) |
| Auth | JWT (Bearer token) |
| Installer | Inno Setup |

## Repository structure

```
GestioPro/
├─ GestioPro.Api/              ASP.NET Core Web API — Controllers, Program.cs, appsettings
├─ GestioPro.Common/           DTOs, Models (EF entities), Enums, Interfaces, Helpers, Exceptions
├─ GestioPro.Infrastructure/   AppDbContext, Migrations, Service implementations
├─ GestioPro.ApiTests/         (orphan: no .csproj, not part of the solution)
├─ GestioPro.InfrastructureTests/  xUnit tests for the Services (in-memory DB)
├─ frontend/
│  ├─ src/pages/               One React page per section (Clienti, Preventivi, ...)
│  ├─ src/services/api.ts      HTTP client towards the backend (fetch)
│  ├─ src/context/             AuthContext, ToastContext
│  └─ electron/main.js         Electron main process (window, tray, backend startup)
├─ installer/GestioPro.iss     Inno Setup script that generates the setup.exe
└─ .vscode/tasks.json          "Avvia tutto" task (DB + backend + frontend in parallel)
```

## Backend (GestioPro.Api / Common / Infrastructure)

Three-layer architecture:

- **Controllers** (`GestioPro.Api/Controllers`) — one REST controller per entity (`CustomersController`, `QuotationsController`, `ContractController`, `ProductsController`, `ProductCategoriesController`, `ContractRenewalController`, `SettingsController`, `UsersController`, `AuditController`, `AuthController`, `HeartBeatController`). Thin: validate the request and delegate to the service.
- **Services** (`GestioPro.Infrastructure/Services`) — business logic, an interface in `GestioPro.Common/Interfaces` plus one implementation. They use `AppDbContext` directly (no separate repository layer).
- **Models / DTOs** (`GestioPro.Common`) — `Models` are the EF Core entities (mapped 1:1 to tables), `DTOs` are the records exposed by the API (never the raw entities, except a few historical exceptions).

**Authentication**: JWT Bearer configured in `Program.cs`. A **fallback authorization policy** requires an authenticated user on every endpoint by default — `[AllowAnonymous]` is only on `POST /auth/login` and `POST /auth/register`. Extra role checks (`[Authorize(Roles = "Admin")]`) are layered on top where needed (`AuditController`, and the admin-only actions in `UsersController`: create, delete, force-update). Public self-registration always creates an `Operator` — the role in the request body is ignored, so nobody can self-elevate to Admin. Since there's never a "first" Admin to promote you, bootstrapping the very first Admin account has to be done directly on the database (see **First Admin user** below).

**Audit log**: `AuditService` writes a row to the `audit` table on every relevant Create/Update/Delete (who, when, what, before/after values), browsable from the Audit page (Admin only).

**Migrations**: EF Core code-first. Default data seeding (company settings, the heartbeat row) lives in `AppDbContext.OnModelCreating` via `HasData`.

## Frontend (React + Vite)

- Routing with `react-router-dom` (`App.tsx`), one page per route under `src/pages`.
- `RequireRole` guards routes reserved for Admins (e.g. `/utenti`, `/audit`) — this must always be mirrored on the backend with `[Authorize(Roles=...)]`, otherwise the page is merely hidden while the API stays directly callable.
- `src/services/api.ts` centralizes all HTTP calls (one object per entity: `ClientiAPI`, `QuotationAPI`, `SettingsAPI`, ...).
- In dev, Vite proxies to `https://localhost:7160` (see `vite.config.ts`); in production the Electron app loads the static files from `dist/`.
- Quotation PDF generation happens client-side with `html2pdf.js` (logo, company data and footer pulled from Settings).

## Desktop app (Electron)

`frontend/electron/main.js` is the main process:

- **Dev** (`npm run electron:dev`): opens only the window pointed at Vite (`localhost:3000`); the backend must be started separately (dotnet run, or the VS Code "Avvia tutto" task).
- **Production** (installed package): also launches the backend as a child process (`GestioPro.Api.exe`, published under `resources/backend`), waits for it to respond on `/api/v1/health`, then shows the window.
- **Tray icon**: always created, with an "Apri" / "Esci" menu. Closing the window (X) hides it to the tray instead of terminating the app; only "Esci" actually quits (app + backend process).
- **Auto-start**: in production the app registers itself as a Windows login item (`app.setLoginItemSettings`), passing the `--hidden` flag, so on PC reboot it starts in the background without opening the window.

## Database and Heartbeat (Supabase)

In production the backend points at a Postgres project on Supabase (connection string in `appsettings.Production.json`, not committed — see the `.example` file). Supabase free-tier projects pause after a period of inactivity: to avoid that, `HeartBeatBackgroundService` (a .NET hosted service) writes a timestamp to the `heartbeat` table right at startup and then periodically (default every 12h, configurable in `appsettings.json` → `HeartBeat:IntervalHours`), for as long as the backend process stays alive.

Since the app auto-starts in the background on every PC boot (see above), the database stays "alive" even if nobody ever opens the window.

### What happens at PC startup

```mermaid
sequenceDiagram
    participant Windows as Windows (login)
    participant Electron as Electron main process
    participant Tray as Tray icon
    participant Window as App window
    participant Backend as GestioPro.Api.exe
    participant Heartbeat as HeartBeatBackgroundService
    participant DB as Database (Supabase)

    Windows->>Electron: Launch GestioPro.exe --hidden (registered login item)
    Electron->>Backend: spawn GestioPro.Api.exe
    Electron->>Tray: create tray icon (Apri / Esci menu)
    Electron->>Window: create window but do NOT show it (--hidden)
    Backend->>Heartbeat: start hosted service
    Heartbeat->>DB: ping immediately (writes a timestamp into "heartbeat")
    Electron->>Backend: poll GET /api/v1/health
    Backend-->>Electron: 200 OK
    Electron->>Window: ready, but stays hidden

    loop every N hours (default 12h)
        Heartbeat->>DB: new ping (keeps the Supabase project awake)
    end

    Note over Tray,Window: The user can interact at any time
    Tray->>Window: click "Apri" → shows/focuses the window
    Window->>Tray: click X on the window → hides again (app stays alive)
    Tray->>Backend: click "Esci" → kills the backend + actually quits the app
```

## Environments: Development vs Production

ASP.NET Core's standard config layering: `appsettings.json` (base, committed — safe placeholder secrets only) → `appsettings.{ASPNETCORE_ENVIRONMENT}.json` (overlay) → environment variables (highest precedence). Two overlays exist:

- `appsettings.Development.json` — committed, local-dev-only values.
- `appsettings.Production.json` — **not committed** (`.gitignore`'d), holds the real Supabase connection string and JWT secret. Create it by copying [appsettings.Production.json.example](GestioPro.Api/appsettings.Production.json.example) and filling in the real values. Never put real credentials in the `.example` file — that one *is* committed.

`ASPNETCORE_ENVIRONMENT` decides which overlay loads. **Gotcha**: if it's unset, ASP.NET Core defaults to `Production`. Local `dotnet run` / F5 debugging only stays on `Development` because `GestioPro.Api/Properties/launchSettings.json` sets it explicitly per profile — if that file is ever missing, malformed (e.g. someone adds a `//` comment, which isn't valid JSON), or you bypass it (running the built DLL directly), you silently fall back to `Production` and start reading/writing **the real Supabase database** from your dev machine. Always check the startup log line `Hosting environment: ...` before assuming which database you're talking to.

To deliberately run against Production locally (e.g. for one-off admin tasks) without touching your normal dev workflow, override the config via environment variables instead of touching `ASPNETCORE_ENVIRONMENT`/`appsettings`:

```bash
ASPNETCORE_ENVIRONMENT=Production \
ASPNETCORE_URLS=http://localhost:5298 \
ConnectionStrings__Default="Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true" \
Jwt__Secret="<production secret>" \
dotnet bin/Release/net10.0/GestioPro.Api.dll
```
(Build the Release configuration first with `dotnet build GestioPro.Api -c Release` — using a separate build output and a non-default port avoids colliding with a `Debug` build/session you may already have running.)

## Supabase setup (from scratch)

1. Create a project at [supabase.com](https://supabase.com); note the database password you set.
2. **Project Settings → Database → Connection string.** Use the **Session pooler** tab (port 5432), not "Direct connection" — new Supabase projects resolve the direct-connection hostname (`db.<ref>.supabase.co`) to an **IPv6-only address**, which fails to resolve on networks/ISPs without proper IPv6 support. The Session pooler hostname (`aws-<n>-<region>.pooler.supabase.com`) is IPv4-compatible. Don't use the "Transaction pooler" (port 6543) either — it doesn't support the prepared statements EF Core migrations need.
3. Convert the copied URI into the Npgsql key-value format and put it in `appsettings.Production.json`:
   ```
   Host=aws-<n>-<region>.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=<db-password>;SSL Mode=Require;Trust Server Certificate=true
   ```
4. Apply migrations: `dotnet ef database update --project GestioPro.Infrastructure --startup-project GestioPro.Api --connection "<connection string above>"`.

## First Admin user

Public registration (`POST /auth/register`) always creates an `Operator`, by design — there's no API path to create the first Admin. Bootstrap it once, directly on the database:

1. Register a normal account (UI "Registrati", or `POST /auth/register`).
2. Promote it with SQL: `UPDATE users SET "UserRole" = 1 WHERE "Username" = '<username>';` (`1` = Admin, `2` = Operator — see `GestioPro.Common/Enums/UserRole.cs`). From then on, every other Admin can be created normally through the Utenti page.

## Release checklist

Full path from "I changed some backend/DB code" to "here's the new installer.exe", in order. Every command below is meant to be run from the repo root in PowerShell, unless stated otherwise.

### 0. Applying new EF Core migrations (only if you changed any `GestioPro.Common/Models/*.cs`)

If your changes touched an entity (added/removed/renamed a field, added a table, ...), you need a migration before anything else. Skip this whole section if there's nothing DB-related in the release.

1. **Generate the migration** (this only writes C# files under `GestioPro.Infrastructure/Migrations/`, it does **not** touch any database yet):
   ```
   dotnet ef migrations add <DescriptiveName> --project GestioPro.Infrastructure --startup-project GestioPro.Api
   ```
   **Gotcha**: this needs to *build* the project first. If Visual Studio (or any other debugger) is currently attached to a running `GestioPro.Api`, the build fails with `MSB3027`/`MSB3021` ("file is locked by ... .NET Core Debugger ...") because it can't overwrite the locked DLLs. Stop the debug session first.
2. **Sanity-check the generated migration** — open the new `..._<DescriptiveName>.cs` file under `GestioPro.Infrastructure/Migrations/` and re-read the `Up()` method. In particular, if you added a **non-nullable** column to a table that already has rows, EF Core defaults `defaultValue` to the CLR default (`0`, `false`, empty string, ...) — for an enum backed column that `0` is very likely **not a valid enum value** (enums here start at `1`), which leaves existing rows in an invalid state. Fix the `defaultValue:` argument by hand to something valid before applying it anywhere.
3. **Apply it to your local dev database first** (safe — it's the local Postgres, not Supabase):
   ```
   dotnet ef database update --project GestioPro.Infrastructure --startup-project GestioPro.Api
   ```
   Confirm the app still works locally against the updated schema before going anywhere near Supabase.
4. **Apply it to Supabase (production)** — same command, just forcing the `Production` environment so it picks up the Supabase connection string from `appsettings.Production.json` instead of the local one from `appsettings.json`:
   ```
   $env:ASPNETCORE_ENVIRONMENT = "Production"
   dotnet ef database update --project GestioPro.Infrastructure --startup-project GestioPro.Api
   Remove-Item Env:\ASPNETCORE_ENVIRONMENT
   ```
   Double-check first with `dotnet ef migrations list --project GestioPro.Infrastructure --startup-project GestioPro.Api` (same env var set) — every already-applied migration is listed plain, anything not yet applied is marked `(Pending)`. This is also how you confirm the command above actually went through: re-run `migrations list` afterward and the `(Pending)` tag should be gone.

   This talks to the **live production database** used by everyone who has the app installed — there's no staging Supabase project. Double, triple check `$env:ASPNETCORE_ENVIRONMENT` is actually `Production` before running `database update` (an empty/wrong value silently falls back to the local dev connection string instead, per the environments gotcha above) and that the migration only *adds* things (new nullable/defaulted columns, new tables) rather than dropping or renaming — anything destructive should go through a manual backup first.

### 1. Bump the version

Edit `installer/GestioPro.iss`, line ~17:
```
#define AppVersion   "0.2.0-beta"
```
This single value drives the installer's `AppVersion`, window title, output filename (`GestioPro_Setup_<version>.exe`) and uninstall entry — nothing else in the repo needs to change for a version bump (`frontend/package.json`'s `"version"` is unrelated npm package metadata, not the app's release version).

### 2. Publish the backend

```
./publish_backend.ps1
```
Runs:
```
dotnet publish GestioPro.Api -c Release -r win-x64 --self-contained true -o GestioPro.Api/bin/Release/net10.0/win-x64/publish
```
`appsettings.Production.json` is picked up automatically since it lives in `GestioPro.Api/`. `--self-contained true` bundles the matching .NET runtime into the published output, so the installed app needs **nothing preinstalled** on the end user's PC — this is deliberate (see the "Errors and fixes" history: a friend's PC without the .NET runtime made the packaged backend silently fail to start, since Electron spawns it with `stdio: 'ignore'` and there's no visible error, just "Failed to fetch" in the UI). Don't switch this back to `false`.

### 3. Build the Electron app

```
./build_electron.ps1
```
i.e. `cd frontend && npm run electron:build` → Vite build + electron-builder in `dir` mode, produces `frontend/dist-electron/win-unpacked/` (the full Electron app, backend included under `resources/backend`).

**If the repo lives inside a OneDrive-synced folder** (e.g. under `Documents`), this step reliably fails with:
```
EBUSY: resource busy or locked, unlink '...\dist-electron\win-unpacked\resources\app.asar'
```
OneDrive locks the freshly-written `app.asar` while it hashes/syncs it, and the lock can outlast the whole build. Don't bother deleting `dist-electron` and retrying — build straight to a location outside the synced folder instead:
```
$outDir = "$env:TEMP\gestiopro-dist-electron"
if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
cd frontend
npx electron-builder --win --config.directories.output="$outDir"
```
**Gotcha**: the electron-builder CLI override for a nested config key is `--config.directories.output=...` (double dash, word `config`) — `-c.directories.output=...` (short flag) does **not** do dot-path expansion and silently gets misparsed into a bogus config file path, failing with a confusing `ENOENT`. Always use the `--config.` form.

Delete the temp folder once the installer (next step) is compiled — it's only scratch space.

### 4. Compile the installer

```
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "/DSourceDir=$env:TEMP\gestiopro-dist-electron\win-unpacked" "installer\GestioPro.iss"
```
(or open [installer/GestioPro.iss](installer/GestioPro.iss) in the Inno Setup Compiler GUI and press Ctrl+F9 — but then it defaults `SourceDir` to `frontend\dist-electron\win-unpacked`, so only do that if you built in step 3 *without* the OneDrive workaround.)

Output: `installer/Output/GestioPro_Setup_<version>.exe`.

### 5. Test the installer

Before distributing it: install on a clean-ish machine (or reinstall locally), check the app starts, tray icon is present, login works against Supabase, autostart is registered (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run\electron.app.GestioPro`, pointing at the install dir with `--hidden`), and the backend log shows heartbeat pings. Then uninstall and confirm that registry value is gone too (the installer cleans it up even though Electron, not the installer, is the one who created it).

## Local development

`.vscode/tasks.json` → the **"Avvia tutto"** task starts, in parallel, in separate panels:
- the local Postgres container (`docker start postgres-gestiopro`)
- the backend (`dotnet run --project GestioPro.Api --launch-profile https`, port 7160)
- the frontend (`npm run dev`, Vite on port 3000)

`.vscode/launch.json` also has "Run Desktop" to start the Electron shell once frontend and backend are already up.
