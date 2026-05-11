# GestioPro

Desktop application for managing clients, invoices and tasks, designed for **freelancers and self-employed professionals**.  
Built with **Java 21 + Spring Boot 3 + JavaFX** - runs entirely locally, no cloud or internet connection required.

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

### Docker

- Run: `docker compose up -d`
- Verify with: `docker compose ps`
- Enter in docker terminal: `docker exec -it postgres-gestiopro bash` 
    - Enter in postgres db: `psql -U sa`
        - list of the databases: `\l`
        - if the database is missing: `CREATE DATABASE GestioPro;`
        - connect to the database: `\c gestiopro`
        - list of the tables: `\dt`
        - to table struct: `\d <table>`
        - to quit from postgres: `\q`
        - to quit from docker terminal: ctrl + d

## Login

Default User:

- username: `admin`
- password: `asdasd123`


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

## Available REST APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List all clients |
| GET | `/api/v1/customers/{id}` | Single client |
| POST | `/api/v1/customers` | Create client |
| PUT | `/api/v1/customers/{id}` | Update client |
| DELETE | `/api/v1/customers/{id}` | Delete client |

> For Invoices and Task APIs: see `docs/spring-boot-guide.md` (section 4).

## Adding a New Feature

1. Create the entity in `com/dennisturco/model/` with `@Entity`
2. Create the repository in `com/dennisturco/repository/` extending `JpaRepository`
3. Create the controller in `com/dennisturco/controller/` with `@RestController`
4. Create the HTML page in `static/` and add it to the routes in `js/app.js`
5. Add the sidebar entry to all HTML pages

📖 Detailed guide with code dennisturcos: **`docs/spring-boot-guide.md`**

## System Requirements

- **Java 21** (JDK, not just JRE)
- **Maven 3.8+**
- Windows (the pom.xml has `javafx.platform=win` - change to `mac` or `linux` if needed)
