const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

// connessione a mysql
async function initDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'meditactive',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Verifica
    try {
      const connection = await pool.getConnection();
      console.log('Database MySQL connesso:', process.env.DB_NAME || 'meditactive');
      connection.release();
    } catch (error) {
      console.error('Errore connessione MySQL:', error.message);
      throw error;
    }
  }
  return pool;
}

// connessione al pool
async function getDB() {
  if (!pool) {
    await initDB();
  }
  return pool;
}

module.exports = {
  initDB,
  getDB
};