const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('Inizio test funzionali per MeditActive API\n');
    
    try {
        // Test 1: Verifica endpoint base
        console.log('Test 1: Test endpoint base...');
        const response1 = await axios.get(BASE_URL);
        console.log('Endpoint base OK:', response1.data);
        
        // Test 2: Crea un nuovo utente
        console.log('\nTest 2: Test creazione utente...');
        const newUser = {
            email: 'functional-test@example.com',
            nome: 'Test',
            cognome: 'Funzionale'
        };
        const userResponse = await axios.post(`${BASE_URL}/api/users`, newUser);
        console.log('Utente creato:', userResponse.data);
        const userId = userResponse.data.id;
        
        // Test 3: Leggi tutti gli utenti
        console.log('\nTest 3: Test lettura utenti...');
        const usersResponse = await axios.get(`${BASE_URL}/api/users`);
        console.log('Utenti trovati:', usersResponse.data.length);
        
        // Test 4: Leggi utente specifico
        console.log('\nTest 4: Test lettura utente specifico...');
        const userByIdResponse = await axios.get(`${BASE_URL}/api/users/${userId}`);
        console.log('Utente trovato:', userByIdResponse.data.email);
        
        // Test 5: Crea un nuovo intervallo
        console.log('\nTest 5: Test creazione intervallo...');
        const newInterval = {
            dataInizio: '2024-01-01',
            dataFine: '2024-01-31',
            utenteId: userId
        };
        const intervalResponse = await axios.post(`${BASE_URL}/api/intervals`, newInterval);
        console.log('Intervallo creato:', intervalResponse.data.id);
        const intervalId = intervalResponse.data.id;
        
        // Test 6: Aggiungi obiettivo all'intervallo
        console.log('\nTest 6: Test aggiunta obiettivo...');
        const goalData = { obiettivo: 'Meditare 15 minuti ogni giorno' };
        const goalResponse = await axios.post(`${BASE_URL}/api/intervals/${intervalId}/obiettivi`, goalData);
        console.log('Obiettivo aggiunto:', goalResponse.data.obiettivi);
        
        // Test 7: Leggi tutti gli intervalli
        console.log('\nTest 7: Test lettura intervalli...');
        const intervalsResponse = await axios.get(`${BASE_URL}/api/intervals`);
        console.log('Intervalli trovati:', intervalsResponse.data.length);
        
        // Test 8: Leggi intervallo specifico
        console.log('\nTest 8: Test lettura intervallo specifico...');
        const intervalByIdResponse = await axios.get(`${BASE_URL}/api/intervals/${intervalId}`);
        console.log('Intervallo trovato con obiettivi:', intervalByIdResponse.data.obiettivi.length);
        
        // Test 8.1: Test filtro per obiettivo
        console.log('\nTest 8.1: Test filtro per obiettivo...');
        const filteredByGoal = await axios.get(`${BASE_URL}/api/intervals?obiettivi=Meditare`);
        console.log('Intervalli filtrati per obiettivo:', filteredByGoal.data.length);
        
        // Test 8.2: Test filtro per data
        console.log('\nTest 8.2: Test filtro per data...');
        const filteredByDate = await axios.get(`${BASE_URL}/api/intervals?dataInizio=2024-01-01&dataFine=2024-12-31`);
        console.log('Intervalli filtrati per data:', filteredByDate.data.length);
        
        // Test 9: Aggiorna utente
        console.log('\nTest 9: Test aggiornamento utente...');
        const updateUserData = {
            nome: 'Test Aggiornato',
            cognome: 'Funzionale Aggiornato',
            email: 'updated-test@example.com'
        };
        const updateUserResponse = await axios.put(`${BASE_URL}/api/users/${userId}`, updateUserData);
        console.log('Utente aggiornato:', updateUserResponse.data.email);
        
        // Test 10: Elimina intervallo
        console.log('\nTest 10: Test eliminazione intervallo...');
        await axios.delete(`${BASE_URL}/api/intervals/${intervalId}`);
        console.log('Intervallo eliminato');
        
        // Test 11: Elimina utente
        console.log('\nTest 11: Test eliminazione utente...');
        await axios.delete(`${BASE_URL}/api/users/${userId}`);
        console.log('Utente eliminato');
        
        console.log('\nTUTTI I TEST FUNZIONALI SONO STATI COMPLETATI CON SUCCESSO!');
        console.log('L\'API MeditActive funziona correttamente');
        console.log('Test filtri: Obiettivi e Date implementati e funzionanti');
        
    } catch (error) {
        console.error('Errore durante i test:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Funzione per attendere che il server sia disponibile
async function waitForServer(maxAttempts = 10) {
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            await axios.get(BASE_URL, { timeout: 2000 });
            console.log('Server disponibile, inizio test...\n');
            return true;
        } catch (error) {
            console.log(`Tentativo ${i}/${maxAttempts}: Server non ancora disponibile, attendo...`);
            if (i < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    return false;
}

// Esegui i test
async function main() {
    try {
        const serverAvailable = await waitForServer();
        if (!serverAvailable) {
            console.error('Impossibile connettersi al server dopo 10 tentativi');
            console.log('Assicurati che il server sia in esecuzione con: npm start');
            process.exit(1);
        }
        
        await runTests();
    } catch (error) {
        console.error('Errore generale:', error.message);
        process.exit(1);
    }
}

main();