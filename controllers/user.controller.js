const { getDB } = require('../config/db');

// Logica per creare un nuovo utente
exports.createUser = async (req, res) => {
  try {
    const { email, nome, cognome } = req.body;
    if (!email || !nome || !cognome) {
      return res.status(400).json({ message: "Email, nome e cognome sono campi obbligatori." });
    }
    
    const database = await getDB();
    // Utilizza un prepared statement per prevenire SQL Injection
    const sql = 'INSERT INTO users (email, nome, cognome) VALUES (?, ?, ?)';
    const result = await database.run(sql, [email, nome, cognome]);
    
    res.status(201).json({ id: result.lastID, email, nome, cognome });
  } catch (error) {
    // Gestisce l'errore specifico di email duplicata
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: `L'email '${req.body.email}' è già in uso.` });
    }
    // Gestisce altri errori del server
    res.status(500).json({ message: "Errore durante la creazione dell'utente.", error: error.message });
  }
};

// Logica per ottenere tutti gli utenti
exports.getAllUsers = async (req, res) => {
  try {
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users';
    const users = await database.all(sql);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero degli utenti.", error: error.message });
  }
};

// Logica per ottenere un singolo utente tramite ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?';
    const user = await database.get(sql, [id]);
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero dell'utente.", error: error.message });
  }
};

// Logica per aggiornare un utente
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, cognome } = req.body;

    // Costruisce la query dinamicamente in base ai campi forniti per aggiornare solo i dati necessari
    let fieldsToUpdate = [];
    let values = [];
    if (email) { fieldsToUpdate.push('email = ?'); values.push(email); }
    if (nome) { fieldsToUpdate.push('nome = ?'); values.push(nome); }
    if (cognome) { fieldsToUpdate.push('cognome = ?'); values.push(cognome); }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: "Nessun dato da aggiornare fornito." });
    }

    values.push(id); // Aggiunge l'ID per la clausola WHERE
    const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    const database = await getDB();
    const result = await database.run(sql, values);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    
    // Ottieni l'utente aggiornato
    const updatedUser = await database.get('SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?', [id]);
    res.status(200).json(updatedUser);

  } catch (error) {
     if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: `L'email '${req.body.email}' è già in uso.` });
    }
    res.status(500).json({ message: "Errore durante l'aggiornamento dell'utente.", error: error.message });
  }
};

// Logica per cancellare un utente
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await database.run(sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    // Restituisce 204 No Content, lo standard per le richieste di cancellazione andate a buon fine
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ message: "Errore durante la cancellazione dell'utente.", error: error.message });
  }
};

