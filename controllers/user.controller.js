const { getDB } = require('../config/db');

// crea utente
exports.createUser = async (req, res) => {
  try {
    const { email, nome, cognome } = req.body;
    if (!email || !nome || !cognome) {
      return res.status(400).json({ message: "Email, nome e cognome sono campi obbligatori." });
    }
    
    const database = await getDB();
   
    const sql = 'INSERT INTO users (email, nome, cognome) VALUES (?, ?, ?)';
    const [result] = await database.execute(sql, [email, nome, cognome]);
    
    res.status(201).json({ id: result.insertId, email, nome, cognome });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: `L'email '${req.body.email}' è già in uso.` });
    }
    res.status(500).json({ message: "Errore durante la creazione dell'utente.", error: error.message });
  }
};

// ottieni tutti utenti
exports.getAllUsers = async (req, res) => {
  try {
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users';
    const [users] = await database.execute(sql);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero degli utenti.", error: error.message });
  }
};

// ottieni singolo utente da ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?';
    const [users] = await database.execute(sql, [id]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero dell'utente.", error: error.message });
  }
};

// aggiorna utente
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, cognome } = req.body;

    // aggiorna solo i dati necessari
    let fieldsToUpdate = [];
    let values = [];
    if (email) { fieldsToUpdate.push('email = ?'); values.push(email); }
    if (nome) { fieldsToUpdate.push('nome = ?'); values.push(nome); }
    if (cognome) { fieldsToUpdate.push('cognome = ?'); values.push(cognome); }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: "Nessun dato da aggiornare fornito." });
    }

    values.push(id);
    const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    const database = await getDB();
    const [result] = await database.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
    
    // Ottieni l'utente aggiornato
    const [users] = await database.execute('SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?', [id]);
    const updatedUser = users[0];
    res.status(200).json(updatedUser);

  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: `L'email '${req.body.email}' è già in uso.` });
    }
    res.status(500).json({ message: "Errore durante l'aggiornamento dell'utente.", error: error.message });
  }
};

// cancella utente
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await database.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utente non trovato." });
    }
   
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ message: "Errore durante la cancellazione dell'utente.", error: error.message });
  }
};

