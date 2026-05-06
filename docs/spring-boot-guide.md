# 📖 Guida pratica: Spring Boot + JavaFX per sviluppatori Java

> Questo documento spiega **come funziona il framework**, come è strutturato il progetto, e come aggiungere nuove funzionalità in modo corretto.

---

## Indice

1. [Come funziona l'app](#1-come-funziona-lapp)
2. [Spring Boot — Concetti chiave](#2-spring-boot--concetti-chiave)
3. [Il pattern MVC con Spring](#3-il-pattern-mvc-con-spring)
4. [Come creare una nuova entità](#4-come-creare-una-nuova-entità)
5. [JPA e SQLite](#5-jpa-e-sqlite)
6. [REST API — Come funzionano le rotte](#6-rest-api--come-funzionano-le-rotte)
7. [Frontend: HTML + JS che parla col backend](#7-frontend-html--js-che-parla-col-backend)
8. [Dipendenza Injection — Cosa è e come usarla](#8-dependency-injection--cosa-è-e-come-usarla)
9. [JavaFX + WebView — Come si integra](#9-javafx--webview--come-si-integra)
10. [Comandi utili e debugging](#10-comandi-utili-e-debugging)
11. [Errori comuni e soluzioni](#11-errori-comuni-e-soluzioni)
12. [Roadmap: cosa aggiungere dopo](#12-roadmap-cosa-aggiungere-dopo)

---

## 1. Come funziona l'app

```
┌─────────────────────────────────────────────────────────┐
│                    JavaFX Desktop App                     │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │  WebView (browser embedded)                        │   │
│  │  └─ carica http://localhost:{porta}                │   │
│  └───────────────────────────────────────────────────┘   │
│                          ↕ HTTP                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Spring Boot (server embedded)                     │   │
│  │  ├─ /          → serve index.html (static files)   │   │
│  │  └─ /api/**    → REST endpoints (JSON)             │   │
│  └───────────────────────────────────────────────────┘   │
│                          ↕ JPA/Hibernate                  │
│  ┌───────────────────────────────────────────────────┐   │
│  │  SQLite database.db                                │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Il flusso completo di una richiesta:**

1. L'utente clicca un bottone in HTML
2. Il JavaScript fa una chiamata `fetch('/api/clienti')`
3. Spring Boot riceve la richiesta sul `ClienteController`
4. Il controller chiama il `ClienteRepository`
5. Hibernate converte la query in SQL e interroga SQLite
6. Il risultato torna come JSON al browser
7. Il JavaScript aggiorna la UI

---

## 2. Spring Boot — Concetti chiave

### `@SpringBootApplication`
È l'annotazione che avvia tutto. La trovi in `WebApp.java`:

```java
@SpringBootApplication
public class WebApp {
    public static void main(String[] args) {
        SpringApplication.run(WebApp.class, args);
    }
}
```

Questa singola annotazione fa 3 cose:
- `@Configuration` — questa classe può dichiarare Bean
- `@EnableAutoConfiguration` — configura automaticamente Spring (Tomcat, JPA, ecc.)
- `@ComponentScan` — scansiona il package e trova tutti i `@Component`, `@Service`, `@Repository`, `@Controller`

### `application.properties`
Configura il comportamento di Spring Boot:

```properties
# Porta server (default 8080 se non specificata)
server.port=8080

# Database SQLite
spring.datasource.url=jdbc:sqlite:database.db
spring.datasource.driver-class-name=org.sqlite.JDBC

# Hibernate crea/aggiorna le tabelle automaticamente
spring.jpa.hibernate.ddl-auto=update

# Mostra le query SQL nel log (utile in sviluppo)
spring.jpa.show-sql=true
```

**Valori di `ddl-auto`:**
| Valore | Comportamento |
|--------|---------------|
| `none` | Non tocca il DB |
| `validate` | Controlla ma non modifica |
| `update` | Aggiunge colonne mancanti (sicuro) |
| `create` | Ricrea le tabelle ad ogni avvio ⚠️ |
| `create-drop` | Ricrea e poi elimina ⚠️ |

---

## 3. Il pattern MVC con Spring

```
┌──────────────┐    chiama    ┌──────────────┐    usa     ┌──────────────┐
│  Controller   │ ──────────→ │   Service    │ ─────────→ │  Repository  │
│  (REST API)   │             │  (logica)    │            │  (database)  │
└──────────────┘             └──────────────┘            └──────────────┘
       ↕                                                         ↕
  JSON / HTML                                              Entity (tabella)
```

### Struttura consigliata del package:

```
com.example/
├── model/              ← Entità JPA (tabelle DB)
│   ├── Cliente.java
│   ├── Fattura.java
│   └── Task.java
├── repository/         ← Interfacce JPA (query)
│   ├── ClienteRepository.java
│   └── FatturaRepository.java
├── service/            ← Logica di business
│   └── ClienteService.java
├── controller/         ← REST endpoints
│   └── ClienteController.java
├── dto/                ← Data Transfer Objects (opzionale)
│   └── ClienteDTO.java
├── DesktopApp.java     ← JavaFX entry point
└── WebApp.java         ← Spring entry point
```

---

## 4. Come creare una nuova entità

Esempio completo: aggiungere **Fattura**.

### Step 1 — Entità (model)

```java
// src/main/java/com/example/model/Fattura.java
package com.example.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fattura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;           // es. "2025-001"

    @ManyToOne                       // relazione con Cliente
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String descrizione;
    private Double importo;
    private Double iva;
    private LocalDate dataEmissione;
    private LocalDate scadenza;
    private String stato;            // "attesa", "pagata", "scaduta"
    private String note;
}
```

**Annotazioni Lombok utili:**
- `@Data` = genera getter, setter, equals, hashCode, toString
- `@NoArgsConstructor` = costruttore vuoto (obbligatorio per JPA)
- `@AllArgsConstructor` = costruttore con tutti i parametri
- `@Builder` = pattern builder per creare oggetti

### Step 2 — Repository

```java
// src/main/java/com/example/repository/FatturaRepository.java
package com.example.repository;

import com.example.model.Fattura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FatturaRepository extends JpaRepository<Fattura, Long> {

    // Spring genera automaticamente la query dal nome del metodo!
    List<Fattura> findByStato(String stato);
    List<Fattura> findByClienteId(Long clienteId);
    List<Fattura> findByScadenzaBefore(LocalDate data);

    // Query personalizzata con JPQL
    @Query("SELECT f FROM Fattura f WHERE f.importo > :minimo ORDER BY f.dataEmissione DESC")
    List<Fattura> findFattureGrandi(@Param("minimo") Double minimo);
}
```

### Step 3 — Controller

```java
// src/main/java/com/example/controller/FatturaController.java
package com.example.controller;

import com.example.model.Fattura;
import com.example.repository.FatturaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fatture")
@CrossOrigin  // necessario per le chiamate dal WebView
public class FatturaController {

    private final FatturaRepository repo;

    // Dependency Injection tramite costruttore (preferibile)
    public FatturaController(FatturaRepository repo) {
        this.repo = repo;
    }

    // GET /api/fatture
    @GetMapping
    public List<Fattura> getAll() {
        return repo.findAll();
    }

    // GET /api/fatture/5
    @GetMapping("/{id}")
    public ResponseEntity<Fattura> getById(@PathVariable Long id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/fatture
    @PostMapping
    public Fattura create(@RequestBody Fattura fattura) {
        return repo.save(fattura);
    }

    // PUT /api/fatture/5
    @PutMapping("/{id}")
    public ResponseEntity<Fattura> update(@PathVariable Long id, @RequestBody Fattura nuova) {
        return repo.findById(id).map(f -> {
            f.setNumero(nuova.getNumero());
            f.setImporto(nuova.getImporto());
            f.setStato(nuova.getStato());
            // ... altri campi
            return ResponseEntity.ok(repo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/fatture/5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/fatture/stato/pagata
    @GetMapping("/stato/{stato}")
    public List<Fattura> getByStato(@PathVariable String stato) {
        return repo.findByStato(stato);
    }
}
```

---

## 5. JPA e SQLite

### Relazioni tra entità

```java
// UNO-A-MOLTI: un Cliente ha molte Fatture
@OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
private List<Fattura> fatture;

// MOLTI-A-UNO: una Fattura appartiene a un Cliente
@ManyToOne
@JoinColumn(name = "cliente_id")
private Cliente cliente;
```

### Tipi di campo supportati da SQLite via Hibernate:
| Java | SQLite |
|------|--------|
| `String` | TEXT |
| `Integer` / `Long` | INTEGER |
| `Double` / `Float` | REAL |
| `Boolean` | INTEGER (0/1) |
| `LocalDate` | TEXT (ISO 8601) |
| `LocalDateTime` | TEXT |
| `byte[]` | BLOB |

### Attenzione: LocalDate con SQLite
Hibernate 6 + SQLite gestisce `LocalDate` come TEXT. Funziona ma assicurati che nel `application.properties` ci sia:

```properties
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
```

---

## 6. REST API — Come funzionano le rotte

### Annotazioni controller:

| Annotazione | HTTP Method | Uso |
|-------------|-------------|-----|
| `@GetMapping` | GET | Leggere dati |
| `@PostMapping` | POST | Creare risorse |
| `@PutMapping` | PUT | Aggiornare (intera risorsa) |
| `@PatchMapping` | PATCH | Aggiornare (parziale) |
| `@DeleteMapping` | DELETE | Eliminare |

### Parametri:

```java
// Parametro nel path: /api/clienti/42
@GetMapping("/{id}")
public Cliente getById(@PathVariable Long id) { ... }

// Query param: /api/clienti?nome=Mario
@GetMapping
public List<Cliente> search(@RequestParam(required=false) String nome) { ... }

// Body JSON: { "nome": "Mario" }
@PostMapping
public Cliente create(@RequestBody Cliente cliente) { ... }
```

### Codici di risposta HTTP:

```java
// 200 OK (default con @RestController)
return cliente;

// 201 Created
return ResponseEntity.status(201).body(nuovoCliente);

// 204 No Content (delete)
return ResponseEntity.noContent().build();

// 404 Not Found
return ResponseEntity.notFound().build();

// 400 Bad Request
return ResponseEntity.badRequest().body("Campo obbligatorio mancante");
```

---

## 7. Frontend: HTML + JS che parla col backend

### Come funziona `api.js`:

Il file `js/api.js` contiene un wrapper attorno a `fetch()` che:
1. Aggiunge automaticamente `Content-Type: application/json`
2. Gestisce gli errori HTTP (4xx, 5xx)
3. Deserializza automaticamente il JSON

```javascript
// Esempio uso in una pagina HTML
async function caricaClienti() {
    try {
        const clienti = await ClientiAPI.getAll();
        // clienti è già un array JavaScript parsato dal JSON
        clienti.forEach(c => console.log(c.nome));
    } catch (e) {
        if (e instanceof ApiError) {
            console.error(`HTTP ${e.status}: ${e.message}`);
        }
    }
}
```

### Aggiungere nuove chiamate API:

```javascript
// Aggiungi in api.js nella sezione del modulo corrispondente
const FattureAPI = {
    getAll:         ()     => apiFetch('/fatture'),
    getById:        (id)   => apiFetch(`/fatture/${id}`),
    getByStato:     (s)    => apiFetch(`/fatture/stato/${s}`),
    create:         (data) => apiFetch('/fatture', { method:'POST', body:JSON.stringify(data) }),
    update:         (id,d) => apiFetch(`/fatture/${id}`, { method:'PUT', body:JSON.stringify(d) }),
    delete:         (id)   => apiFetch(`/fatture/${id}`, { method:'DELETE' }),
};
```

---

## 8. Dependency Injection — Cosa è e come usarla

Spring gestisce la creazione degli oggetti. Tu dichiari **di cosa hai bisogno**, Spring te lo fornisce.

```java
// ❌ Modo sbagliato (crei tu l'oggetto)
public class ClienteController {
    private ClienteRepository repo = new ClienteRepository(); // ERRORE: non funziona con JPA
}

// ✅ Modo corretto (Spring inietta il repo)
public class ClienteController {
    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) { // Spring chiama questo costruttore
        this.repo = repo;
    }
}
```

### Annotazioni per i Bean:
| Annotazione | Uso |
|-------------|-----|
| `@Component` | Classe generica gestita da Spring |
| `@Service` | Logica di business |
| `@Repository` | Accesso al DB |
| `@RestController` | Controller REST |
| `@Configuration` | Classe di configurazione |

---

## 9. JavaFX + WebView — Come si integra

`DesktopApp.java` fa queste cose nell'ordine:

```java
public void start(Stage stage) {

    // 1. Avvia Spring Boot in background
    ConfigurableApplicationContext context =
        SpringApplication.run(WebApp.class);

    // 2. Legge la porta su cui Spring sta ascoltando
    int port = context.getEnvironment()
            .getProperty("local.server.port", Integer.class);

    // 3. Apre un WebView che punta al server locale
    WebView webView = new WebView();
    webView.getEngine().load("http://localhost:" + port);

    // 4. Mostra la finestra
    stage.setTitle("Gestionale");
    stage.setScene(new Scene(webView, 1200, 800));
    stage.show();
}
```

### Personalizzare la finestra JavaFX:

```java
// Dimensioni
stage.setScene(new Scene(webView, 1400, 900));

// Dimensioni minime
stage.setMinWidth(800);
stage.setMinHeight(600);

// Fullscreen
stage.setMaximized(true);

// Icona (metti icon.png in src/main/resources/)
stage.getIcons().add(new Image(
    getClass().getResourceAsStream("/icon.png")
));

// Intercetta chiusura per spegnere Spring Boot
stage.setOnCloseRequest(e -> {
    context.close();
    Platform.exit();
});
```

### Comunicazione JavaFX ↔ JavaScript (avanzato):

```java
// Dal Java verso JS
webView.getEngine().executeScript("showToast('Messaggio da Java', 'success')");

// Dal JS verso Java (tramite hook)
JSObject window = (JSObject) webView.getEngine().executeScript("window");
window.setMember("javaApp", new JavaBridge()); // espone un oggetto Java a JS
```

---

## 10. Comandi utili e debugging

### Avviare l'applicazione:
```bash
mvn clean javafx:run
```

### Solo il server Spring (senza finestra):
```bash
mvn spring-boot:run
```

### Controllare le API via browser/curl:
```bash
# Tutti i clienti
curl http://localhost:8080/api/clienti

# Creare un cliente
curl -X POST http://localhost:8080/api/clienti \
     -H "Content-Type: application/json" \
     -d '{"nome":"Mario Rossi"}'

# Eliminare cliente con id=1
curl -X DELETE http://localhost:8080/api/clienti/1
```

### Vedere il database SQLite:
Apri `database.db` con [DB Browser for SQLite](https://sqlitebrowser.org/) (gratuito).

### Log di Spring Boot:
I log mostrano:
- Le query SQL eseguite (`show-sql=true`)
- Gli errori con stack trace
- La porta su cui ascolta il server

### Porta già in uso:
```bash
# Trova il processo che usa la porta 8080
netstat -ano | findstr :8080

# Killalo (sostituisci <PID>)
taskkill /PID <PID> /F
```

---

## 11. Errori comuni e soluzioni

### `Field ... required a bean of type ... that could not be found`
**Causa:** Spring non trova una classe annotata.  
**Soluzione:** Assicurati che la classe abbia `@Service`, `@Repository`, o `@Component`, e che stia nel package `com.example` (o sotto-package).

### `Table ... not found`
**Causa:** Hibernate non ha creato la tabella.  
**Soluzione:** Verifica `ddl-auto=update` in `application.properties`. Al primo avvio Hibernate crea le tabelle basandosi sulle entità `@Entity`.

### `No serializer found for class ...`
**Causa:** Jackson non riesce a serializzare l'entità JPA in JSON (di solito per un loop di relazioni bidirezionali).  
**Soluzione:**
```java
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Cliente { ... }

// O su una relazione circolare
@JsonBackReference  // sul lato "figlio"
private Cliente cliente;

@JsonManagedReference  // sul lato "padre"
private List<Fattura> fatture;
```

### `CORS error` in WebView
**Causa:** Il JavaScript fa richieste ma Spring rifiuta per CORS.  
**Soluzione:** `@CrossOrigin` sul controller (già presente), oppure configurazione globale:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("*");
    }
}
```

### `LazyInitializationException`
**Causa:** Stai accedendo a una relazione lazy fuori dalla sessione JPA.  
**Soluzione:** Usa `FetchType.EAGER` sulla relazione, oppure `@Transactional` sul metodo del service.

---

## 12. Roadmap: cosa aggiungere dopo

### Priorità alta:
- [ ] **FatturaController** + entità `Fattura` con relazione `@ManyToOne` a `Cliente`
- [ ] **TaskController** + entità `Task`
- [ ] **DashboardController** che ritorna statistiche aggregate (`/api/dashboard/stats`)
- [ ] Campi aggiuntivi a `Cliente` (email, telefono, città, piva, note)

### Priorità media:
- [ ] **Validazione** con `@Valid` + `@NotBlank`, `@Email` sulle entità
- [ ] **Paginazione** con `Pageable` nei repository per tabelle grandi
- [ ] **Ricerca** con `@Query` o `Specification` JPA
- [ ] **Export PDF** fatture con iText o Apache PDFBox

### Priorità bassa (ma utile):
- [ ] **Autenticazione** con Spring Security (utile se l'app diventa multi-utente)
- [ ] **Backup automatico** del database SQLite
- [ ] **Notifiche desktop** con JavaFX `Notifications`
- [ ] **Aggiornamento automatico** via GitHub Releases

---

*Documento generato per il progetto JavaTestApp — Spring Boot 3.2.5 + JavaFX 21 + SQLite*
