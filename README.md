# GestioPro

Business management application (customers, products, quotations, invoices, contracts) for **freelancers and self-employed professionals**, built with **ASP.NET Core 10**, **Entity Framework Core**, and a **TypeScript/Vite** frontend.

---

## Project Structure

```bash
GestioPro/
├── GestioPro.slnx              ← Solution file (open with VS 2022 17.13+ or dotnet CLI)
│
├── GestioPro.Common/           ← Shared layer (Models, DTOs, Interfaces, Enums, Mappers, Exceptions)
├── GestioPro.Infrastructure/   ← Data layer (AppDbContext, Services with EF Core + LINQ)
├── GestioPro.Api/              ← Web API layer (Controllers, Program.cs, DI registration)
│   ├── icon.ico                ← Application icon
│   └── appsettings.json        ← Connection string and configuration
│
└── frontend/                   ← TypeScript + Vite frontend
    ├── src/                    → .ts source files
    ├── *.html                  → HTML pages
    ├── css/                    → Stylesheets
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
# From the repo root
cd GestioPro.Api
dotnet run
```

The API will be available at:

- HTTP:  https://localhost:5164
- HTTPS: https://localhost:7160
- HTTPS: https://localhost:7160/swagger.index.html

To run in a specific environment:

```bash
dotnet run --environment Development
dotnet run --environment Production
```

To build the full solution:

```bash
dotnet build GestioPro.slnx
```

### EF Core Migrations

```bash
# To DROP the current db (if needed)
dotnet ef database drop --project GestioPro.Infrastructure --startup-project GestioPro.Api

# Add a new migration (run from repo root)
dotnet ef migrations add InitialCreate --project GestioPro.Infrastructure --startup-project GestioPro.Api

# Apply migrations to the database
dotnet ef database update --project GestioPro.Infrastructure --startup-project GestioPro.Api
```

---

## 3. Run the Frontend

```bash
cd frontend
npm install       # first time only
npm run dev       # starts Vite dev server on http://localhost:3000
```

The frontend proxies all `/api` calls to the backend automatically — no CORS issues in development.

To build for production:

```bash
npm run build     # output in frontend/dist/
```

---

## 4. Full Stack — Start Everything

Open **two terminals**:

**Terminal 1 — Backend:**

```bash
cd GestioPro.Api
dotnet run
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Then open your browser at **http://localhost:3000**.

---

## 5. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/customers` | List all customers |
| GET | `/api/v1/customers/{id}` | Get customer by ID |
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
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/settings` | List settings |

---

## 6. DI Registration (how it works)

Services are registered in `GestioPro.Api/Program.cs`. As you implement each service, uncomment the corresponding line:

```csharp
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProductService, ProductService>();
// ...
```

The controllers receive services via **constructor injection** (primary constructor syntax):
```csharp
public class CustomersController(ICustomerService customerService) : ControllerBase { }
```

---

## 7. Implementation Guide (TODOs)

The services and controllers contain `// TODO` comments to guide your implementation. Start from:

1. `GestioPro.Common/Mappers/CustomerMapper.cs` — implement `ToResponseDto()` and `ToEntity()`
2. `GestioPro.Infrastructure/Services/CustomerService.cs` — implement with LINQ + async/await + EF Core
3. `GestioPro.Api/Controllers/CustomersController.cs` — implement action methods
4. Uncomment `AddScoped<ICustomerService, CustomerService>()` in `Program.cs`
5. Repeat for `Product`, `Quotation`, `User`, `Settings`

**Key .NET concepts to practice:**
- **LINQ**: `Where()`, `Select()`, `Include()`, `FirstOrDefaultAsync()`, `AnyAsync()`
- **EF Core**: `context.Customers.ToListAsync()`, `context.SaveChangesAsync()`
- **async/await**: all service and controller methods are already `async Task<>`
- **DI**: `AddScoped` / `AddTransient` / `AddSingleton` in `Program.cs`
- **TypeScript**: convert `frontend/src/*.ts` files (typed API calls, interfaces for DTOs)

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL 15 |
| Frontend | TypeScript + Vite |
| Containerization | Docker Compose |