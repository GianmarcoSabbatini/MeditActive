# MeditActive API

API REST per la gestione di utenti, intervalli di meditazione e obiettivi.

## Avvio Rapido

```bash
# Installa le dipendenze
npm install

# Configura il database (vedi sezione Database)
npm run setup

# Avvia il server
npm run dev
```

Server disponibile su http://localhost:3000

## Prerequisiti

- Node.js versione 16 o superiore
- MySQL Server (si consiglia XAMPP)
- npm

## Configurazione Database

### Opzione 1: XAMPP (consigliata)

1. Scarica XAMPP da https://www.apachefriends.org/
2. Installa e avvia XAMPP Control Panel
3. Clicca Start accanto a MySQL
4. Il database sarà disponibile su localhost:3306

### Opzione 2: MySQL Standalone

1. Installa MySQL Server dal sito ufficiale
2. Avvia il servizio MySQL
3. Configura le credenziali nel file .env

### File .env

Crea un file .env nella root del progetto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=meditactive
PORT=3000
```

Nota: per XAMPP, lascia DB_PASSWORD vuoto.

## Tecnologie

- Node.js con Express.js per il server
- MySQL come database relazionale
- mysql2 per la connessione al database
- Mocha, Chai e Sinon per i test
- Winston per il logging
- Morgan per il logging delle richieste HTTP

## Struttura Database

Il database viene creato automaticamente con il comando 
pm run setup.

### Tabella users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cognome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabella intervals

```sql
CREATE TABLE intervals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabella interval_goals

```sql
CREATE TABLE interval_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interval_id INT NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interval_id) REFERENCES intervals(id) ON DELETE CASCADE
);
```

## API Endpoints

### Utenti

**Crea utente**
```http
POST /api/users
Content-Type: application/json

{
  "email": "mario.rossi@example.com",
  "nome": "Mario",
  "cognome": "Rossi"
}
```

**Lista utenti**
```http
GET /api/users
```

**Dettaglio utente**
```http
GET /api/users/:id
```

**Aggiorna utente**
```http
PUT /api/users/:id
Content-Type: application/json

{
  "nome": "Marco"
}
```

**Elimina utente**
```http
DELETE /api/users/:id
```

### Intervalli

**Crea intervallo**
```http
POST /api/intervals
Content-Type: application/json

{
  "dataInizio": "2025-10-01",
  "dataFine": "2025-10-31",
  "utenteId": 1
}
```

**Lista intervalli**
```http
GET /api/intervals
```

**Filtra intervalli**
```http
GET /api/intervals?obiettivi=meditazione
GET /api/intervals?dataInizio=2024-01-01&dataFine=2024-12-31
```

**Dettaglio intervallo**
```http
GET /api/intervals/:id
```

**Aggiorna intervallo**
```http
PUT /api/intervals/:id
Content-Type: application/json

{
  "dataInizio": "2025-10-05",
  "dataFine": "2025-11-05"
}
```

**Elimina intervallo**
```http
DELETE /api/intervals/:id
```

**Aggiungi obiettivo**
```http
POST /api/intervals/:id/obiettivi
Content-Type: application/json

{
  "obiettivo": "Meditazione mattutina"
}
```

## Testing

Il progetto utilizza due approcci complementari per i test:

### Test Unit (principale)

I test unit utilizzano Mocha, Chai e Sinon per testare la logica dei controller in modo isolato, senza dipendenze esterne.

```bash
npm test

### Test E2E (opzionale)

I test end-to-end testano l'applicazione completa con chiamate HTTP reali. Richiedono il server e il database attivi.

```bash
# Terminale 1
npm run dev

# Terminale 2
npm run test:e2e
```

### Tutti i test

```bash
npm run test:all
```

## Logging

L'applicazione utilizza Winston per il logging strutturato:

- **logs/error.log** - solo errori
- **logs/combined.log** - tutti i log
- **logs/exceptions.log** - eccezioni non gestite
- **logs/rejections.log** - promise rejections

In sviluppo, i log vengono mostrati anche nella console con colori.

## Sicurezza

- **Prepared Statements**: tutte le query utilizzano prepared statements per prevenire SQL Injection
- **Validazione input**: controllo dei dati obbligatori e formati
- **Error handling centralizzato**: gestione coerente degli errori
- **Constraint database**: chiavi esterne e vincoli di integrità

## Validazioni

### Utenti
- Email obbligatoria e univoca
- Nome e cognome obbligatori

### Intervalli
- dataInizio, dataFine e utenteId obbligatori
- dataFine non può essere precedente a dataInizio
- utenteId deve esistere

## Codici HTTP

- 200 - Operazione completata
- 201 - Risorsa creata
- 204 - Cancellazione completata
- 400 - Dati non validi
- 404 - Risorsa non trovata
- 500 - Errore server

## Script Disponibili

```bash
npm start          # Avvia in produzione
npm run dev        # Avvia con nodemon (sviluppo)
npm run setup      # Configura database
npm test           # Test unit
npm run test:unit  # Test unit esplicito
npm run test:e2e   # Test end-to-end
npm run test:all   # Tutti i test
```

## Struttura Progetto

```
MeditActive/
├── config/
│   ├── db.js
│   └── logger.js
├── controllers/
│   ├── user.controller.js
│   └── interval.controller.js
├── middleware/
│   ├── errorHandler.js
│   └── errors.js
├── routes/
│   ├── user.routes.js
│   └── interval.routes.js
├── test/
│   ├── unit/
│   │   └── controllers.test.js
│   └── e2e/
│       └── functional.test.js
├── logs/
├── schema.sql
├── setup-database.js
├── server.js
└── package.json
```

## Troubleshooting

**Errore connessione database**
1. Verifica che MySQL sia attivo
2. Controlla le credenziali nel file .env
3. Verifica che la porta 3306 sia libera

**Test falliscono**
- I test unit non richiedono server attivo
- I test E2E richiedono server e database attivi

**Reset database**
```bash
npm run setup
```

## Licenza

ISC
