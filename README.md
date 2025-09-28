# MeditActive API

API REST## Configurazione Databas## Tecnologie Utilizzate MySQLul per l'applicazione MeditActive - gestione utenti, intervalli di meditazione e obiettivi.

## Avvio Rapido

### Prerequisiti
- Node.js >= 16
- npm
- MySQL Server (consigliato XAMPP)

### Installazione e Avvio
```bash
# 1. Installa dipendenze
npm install

# 2. Configura MySQL nel file .env (vedi sezione Database)

# 3. Avvia MySQL (tramite XAMPP o comando mysql)

# 4. Configura il database MySQL
npm run setup

# 5. Avvia il server in modalità sviluppo
npm run dev
```

Il server sarà disponibile su **http://localhost:3000**

## �️ Configurazione Database MySQL

### Opzione 1: XAMPP (Raccomandato per principianti)
1. Scarica XAMPP da https://www.apachefriends.org/
2. Installa XAMPP
3. Apri "XAMPP Control Panel"
4. Clicca "Start" accanto a "MySQL"
5. Il database sarà disponibile su localhost:3306

### Opzione 2: MySQL Standalone
1. Installa MySQL Server
2. Avvia il servizio MySQL
3. Modifica il file `.env` con le tue credenziali

### File .env
Crea/modifica il file `.env` nella root del progetto:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Lascia vuoto per XAMPP
DB_NAME=meditactive
PORT=3000
```

## �📚 Tecnologie Utilizzate

- **Node.js** con **Express.js** - Server e routing
- **MySQL** - Database relazionale 
- **mysql2** - Driver MySQL per Node.js
- **Prepared Statements** - Prevenzione SQL Injection
- **Nodemon** - Hot reload in sviluppo

## Struttura Database

Il database MySQL viene creato automaticamente con le seguenti tabelle:

### Tabella `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cognome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### Tabella `intervals`
```sql
CREATE TABLE intervals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### Tabella `interval_goals`
```sql
CREATE TABLE interval_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interval_id INT NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interval_id) REFERENCES intervals(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

## 🔌 API Endpoints

### Utenti (`/api/users`)

#### Crea utente
```http
POST /api/users
Content-Type: application/json

{
  "email": "mario.rossi@example.com",
  "nome": "Mario",
  "cognome": "Rossi"
}
```

#### Lista tutti gli utenti
```http
GET /api/users
```

#### Ottieni utente specifico
```http
GET /api/users/:id
```

#### Aggiorna utente
```http
PUT /api/users/:id
Content-Type: application/json

{
  "nome": "Marco"  // Campi opzionali: nome, cognome, email
}
```

#### Elimina utente
```http
DELETE /api/users/:id
```

### Intervalli (`/api/intervals`)

#### Crea intervallo
```http
POST /api/intervals
Content-Type: application/json

{
  "dataInizio": "2025-10-01",
  "dataFine": "2025-10-31",
  "utenteId": 1
}
```

#### Lista tutti gli intervalli
```http
GET /api/intervals
```

#### Lista intervalli con filtri
```http
# Filtra per obiettivo
GET /api/intervals?obiettivi=meditazione

# Filtra per range di date
GET /api/intervals?dataInizio=2024-01-01&dataFine=2024-12-31

# Filtra combinando obiettivi e date
GET /api/intervals?obiettivi=rilassamento&dataInizio=2024-01-01&dataFine=2024-06-30
```

#### Ottieni intervallo specifico
```http
GET /api/intervals/:id
```

#### Aggiorna intervallo
```http
PUT /api/intervals/:id
Content-Type: application/json

{
  "dataInizio": "2025-10-05",  // Campi opzionali
  "dataFine": "2025-11-05"
}
```

#### Elimina intervallo
```http
DELETE /api/intervals/:id
```

#### Aggiungi obiettivo a intervallo
```http
POST /api/intervals/:id/obiettivi
Content-Type: application/json

{
  "obiettivo": "Meditazione quotidiana"
}
```

##  Test API Completi

### Test Users
```bash
# Crea utente
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nome":"Test","cognome":"User"}'

# Lista utenti
curl http://localhost:3000/api/users

# Aggiorna utente (sostituisci ID)
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Updated"}'

# Elimina utente (sostituisci ID)  
curl -X DELETE http://localhost:3000/api/users/1
```

### Test Intervals
```bash
# Crea intervallo (sostituisci utenteId con ID valido)
curl -X POST http://localhost:3000/api/intervals \
  -H "Content-Type: application/json" \
  -d '{"dataInizio":"2025-10-01","dataFine":"2025-10-31","utenteId":1}'

# Aggiungi obiettivo (sostituisci ID intervallo)
curl -X POST http://localhost:3000/api/intervals/1/obiettivi \
  -H "Content-Type: application/json" \
  -d '{"obiettivo":"Meditazione mattutina"}'

# Lista intervalli
curl http://localhost:3000/api/intervals
```

## Sicurezza

- **Prepared Statements**: Tutte le query utilizzano prepared statements per prevenire SQL Injection
- **Validazione Input**: Controllo dati obbligatori e formato email
- **Gestione Errori**: Messaggi di errore informativi senza esporre dettagli interni
- **Constraint Database**: Chiavi esterne e vincoli di integrità

## Validazioni e Error Handling

### Validazioni Utenti
- Email obbligatoria e formato email valido
- Nome e cognome obbligatori
- Email deve essere univoca (errore 409 se duplicata)

### Validazioni Intervalli
- dataInizio, dataFine e utenteId obbligatori
- dataFine non può essere precedente a dataInizio
- utenteId deve esistere nella tabella users

### Codici di Stato HTTP
- `200` - Operazione completata con successo
- `201` - Risorsa creata con successo
- `204` - Operazione di cancellazione completata
- `400` - Dati di input non validi
- `404` - Risorsa non trovata
- `409` - Conflitto (email duplicata)
- `500` - Errore interno del server

## Scripts Disponibili

```bash
npm start          # Avvia server in produzione
npm run dev        # Avvia server in sviluppo con nodemon
npm run setup      # Esegue setup database MySQL
npm test           # Esegue test funzionali
```

## Struttura Progetto

```
progetto node/
├── config/
│   └── db.js              # Configurazione database MySQL
├── controllers/
│   ├── user.controller.js     # Logica business utenti
│   └── interval.controller.js # Logica business intervalli
├── routes/
│   ├── user.routes.js         # Rotte utenti
│   └── interval.routes.js     # Rotte intervalli
├── schema.sql                 # Schema database MySQL
├── setup-database.js          # Script configurazione database
├── test.js                    # Test funzionali automatici
├── server.js                  # Entry point applicazione
└── package.json               # Dipendenze e script
```

## 🐛 Troubleshooting

### Server non parte
```bash
# Verifica se la porta 3000 è libera
lsof -ti :3000

# Se occupata, termina il processo
lsof -ti :3000 | xargs kill -9
```

### Errori database
Per risolvere problemi con il database MySQL:
```bash
# Ricrea il database
node setup-database.js

# Oppure usa il comando npm
npm run setup
```

### Reset completo
```bash
# Rimuovi node_modules e reinstalla
rm -rf node_modules
npm install

# Ricrea il database
node setup-database.js

# Avvia il server
npm start
```

---

**Progetto completato e testato**  
Database: MySQL, Sicurezza: Prepared Statements, API: REST compliant
