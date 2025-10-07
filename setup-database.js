const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('Configurazione database MySQL...');
    
    try {
        // Prima connessione senza specificare il database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        
        console.log('Connesso al server MySQL');
        
        // Leggi ed esegui lo schema SQL
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Esecuzione schema SQL...');
        await connection.query(schemaSQL);
        
        await connection.end();
        
        console.log('\n✓ Setup database completato con successo!');
        console.log('✓ Database "meditactive" creato/verificato');
        console.log('✓ Tabelle create: users, intervals, interval_goals, sessions');
        console.log('✓ Indici ottimizzati creati');
        
    } catch (error) {
        console.error('\n✗ Errore durante il setup del database:', error.message);
        console.log('\nSuggerimenti:');
        console.log('1. Assicurati che MySQL sia in esecuzione (XAMPP Control Panel)');
        console.log('2. Controlla le credenziali nel file .env');
        console.log('3. Verifica che la porta 3306 sia libera');
        process.exit(1);
    }
}

setupDatabase();