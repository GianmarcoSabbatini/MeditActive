// Importazione delle librerie necessarie
const express = require('express');
const dotenv = require('dotenv');

// Importazione delle rotte definite per le diverse parti dell'API
const userRoutes = require('./routes/user.routes');
const intervalRoutes = require('./routes/interval.routes');
const db = require('./config/db'); // Importa la configurazione del db per testare la connessione

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Creazione di un'istanza dell'applicazione Express
const app = express();

// Middleware per il parsing del corpo delle richieste in formato JSON
app.use(express.json());

// Definizione della porta su cui il server sarà in ascolto
// Usa la porta definita nel file .env, altrimenti la 3000 come default
const PORT = process.env.PORT || 3000;

// Definizione delle rotte principali dell'API
// Tutte le rotte per gli utenti inizieranno con /api/users
app.use('/api/users', userRoutes);
// Tutte le rotte per gli intervalli inizieranno con /api/intervals
app.use('/api/intervals', intervalRoutes);

// Rotta di base per testare se il server è attivo
app.get('/', (req, res) => {
  res.send('Benvenuto nelle API di MeditActive!');
});

// Funzione per avviare il server
const startServer = async () => {
    try {
        // Inizializza il database SQLite
        await db.initDB();
        console.log('Connesso con successo al database SQLite.');

        // Mette il server in ascolto sulla porta specificata
        app.listen(PORT, () => {
            console.log(`Server in ascolto sulla porta ${PORT}`);
        });
    } catch (error) {
        console.error("Impossibile connettersi al database:", error.message);
        process.exit(1); // Esce dal processo se la connessione al db fallisce
    }
};

// Avvia il server
startServer();

// Esporta l'app per poterla usare nei test
module.exports = app;

