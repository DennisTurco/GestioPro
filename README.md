# 📊 Freelance Management App — Desktop

Desktop application for managing clients, invoices and tasks, designed for **freelancers and self-employed professionals**.  
Built with **Java 21 + Spring Boot 3 + JavaFX** — runs entirely locally, no cloud or internet connection required.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop window | JavaFX 21 + WebView |
| Embedded server | Spring Boot 3.2.5 (Tomcat) |
| REST API | Spring MVC (`@RestController`) |
| Database | SQLite 3 (file `database.db`) |
| ORM | Hibernate / Spring Data JPA |
| Frontend | HTML5 + CSS3 (custom, no framework) + Vanilla JS |
| Build | Maven |

---

## Features

- **Dashboard** — real-time KPIs (clients, revenue, open invoices, tasks)
- **Clients** — contact management with search, create, edit, delete, CSV export
- **Invoices** — issue invoices with statuses (pending / paid / overdue), filters, totals
- **Tasks** — to-do list with priorities, statuses, client links
- **Settings** — profile, billing preferences, theme customisation

---

## Project Structure

```
JavaTestApp/
├── docs/
│   └── spring-boot-guide.md     ← Framework guide (READ THIS FIRST!) [in Italian]
├── src/main/
│   ├── java/com/example/
│   │   ├── Cliente.java          ← JPA entity
│   │   ├── ClienteController.java← REST controller
│   │   ├── ClienteRepository.java← JPA repository
│   │   ├── DesktopApp.java       ← JavaFX entry point
│   │   └── WebApp.java           ← Spring Boot entry point
│   └── resources/
│       ├── application.properties
│       └── static/               ← Frontend (served by Spring)
│           ├── css/
│           │   ├── theme.css     ← ⭐ ONLY change this file for a new client
│           │   ├── components.css← Reusable UI components
│           │   └── app.css       ← Layout and utility classes
│           ├── js/
│           │   ├── api.js        ← REST client
│           │   └── app.js        ← Navigation and helpers
│           ├── index.html        ← Dashboard
│           ├── clienti.html      ← Client management
│           ├── fatture.html      ← Invoice management
│           ├── task.html         ← Tasks and appointments
│           └── impostazioni.html ← Settings
├── database.db                   ← SQLite database (auto-created on first run)
└── pom.xml
```

---

## Quick Start

```bash
# Launch the full desktop app (with window)
mvn clean javafx:run

# Run only the web server (no window, useful for debugging)
mvn spring-boot:run
# then open http://localhost:8080 in your browser
```

### Port already in use (`Port 8080 was already in use`)
```bash
# Find the process
netstat -ano | findstr :8080

# Kill it (replace <PID> with the number found above)
taskkill /PID <PID> /F
```

---

## Changing the Theme / Client Branding

Open **`src/main/resources/static/css/theme.css`** and edit the values in the `BRAND COLORS` section:

```css
:root {
    --color-primary:      #2563EB;  /* main colour */
    --color-accent:       #10B981;  /* secondary accent */
    --sidebar-bg:         #1E293B;  /* sidebar background */
    /* ...all other values are documented in the file */
}
```

This is the **only file you need to touch** for a complete restyling.

---

## Available REST APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clienti` | List all clients |
| GET | `/api/clienti/{id}` | Single client |
| POST | `/api/clienti` | Create client |
| PUT | `/api/clienti/{id}` | Update client |
| DELETE | `/api/clienti/{id}` | Delete client |

> For Invoices and Task APIs: see `docs/spring-boot-guide.md` (section 4).

---

## Adding a New Feature

1. Create the entity in `com/example/model/` with `@Entity`
2. Create the repository in `com/example/repository/` extending `JpaRepository`
3. Create the controller in `com/example/controller/` with `@RestController`
4. Create the HTML page in `static/` and add it to the routes in `js/app.js`
5. Add the sidebar entry to all HTML pages

📖 Detailed guide with code examples: **`docs/spring-boot-guide.md`**

---

## System Requirements

- **Java 21** (JDK, not just JRE)
- **Maven 3.8+**
- Windows (the pom.xml has `javafx.platform=win` — change to `mac` or `linux` if needed)
