const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let db;

// Inizializza la connessione SQLite
async function initDB() {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'meditactive.sqlite');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Crea le tabelle se non esistono
    await createTables();
    console.log('Database SQLite connesso:', dbPath);
  }
  return db;
}

// Crea le tabelle necessarie
async function createTables() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      nome VARCHAR(255) NOT NULL,
      cognome VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS intervals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS interval_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interval_id INTEGER NOT NULL,
      goal_name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interval_id) REFERENCES intervals (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);
}

// Funzione per ottenere la connessione db
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}

module.exports = {
  initDB,
  getDB,
  // Manteniamo compatibilità con il codice esistente che usa pool
  query: async (sql, params = []) => {
    const database = await getDB();
    return await database.all(sql, params);
  },
  execute: async (sql, params = []) => {
    const database = await getDB();
    return await database.run(sql, params);
  }
};