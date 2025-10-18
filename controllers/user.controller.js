const { getDB } = require('../config/db');
const logger = require('../config/logger');

/**
 * @desc    Crea un nuovo utente
 * @route   POST /api/users
 * @access  Public
 */
exports.createUser = async (req, res) => {
  try {
    const { email, nome, cognome } = req.body;
    if (!email || !nome || !cognome) {
      return res.status(400).json({ message: "Email, nome e cognome sono campi obbligatori" });
    }
    
    // Validazione lunghezza campi
    if (email.length > 255) {
      return res.status(400).json({ message: "L'email non può superare i 255 caratteri" });
    }
    if (nome.length > 100) {
      return res.status(400).json({ message: "Il nome non può superare i 100 caratteri" });
    }
    if (cognome.length > 100) {
      return res.status(400).json({ message: "Il cognome non può superare i 100 caratteri" });
    }
    
    const database = await getDB();
    const sql = 'INSERT INTO users (email, nome, cognome) VALUES (?, ?, ?)';
    const [result] = await database.execute(sql, [email, nome, cognome]);
    
    logger.info(`Nuovo utente creato: ${email} (ID: ${result.insertId})`);
    
    res.status(201).json({ id: result.insertId, email, nome, cognome });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      logger.warn(`Tentativo di creare utente con email duplicata: ${req.body.email}`);
      return res.status(400).json({ message: `L'email '${req.body.email}' è già in uso` });
    }
    logger.error(`Errore creazione utente: ${error.message}`);
    res.status(500).json({ message: "Errore durante la creazione dell'utente", error: error.message });
  }
};

/**
 * @desc    Ottieni tutti gli utenti
 * @route   GET /api/users
 * @access  Public
 */
exports.getAllUsers = async (req, res) => {
  try {
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users';
    const [users] = await database.execute(sql);
    
    logger.debug(`Recuperati ${users.length} utenti`);
    
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Errore recupero utenti: ${error.message}`);
    res.status(500).json({ message: "Errore durante il recupero degli utenti", error: error.message });
  }
};

/**
 * @desc    Ottieni utente per ID
 * @route   GET /api/users/:id
 * @access  Public
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?';
    const [users] = await database.execute(sql, [id]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Errore recupero utente: ${error.message}`);
    res.status(500).json({ message: "Errore durante il recupero dell'utente", error: error.message });
  }
};

/**
 * @desc    Aggiorna utente
 * @route   PUT /api/users/:id
 * @access  Public
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, cognome } = req.body;

    // Validazione lunghezza campi
    if (email && email.length > 255) {
      return res.status(400).json({ message: "L'email non può superare i 255 caratteri" });
    }
    if (nome && nome.length > 100) {
      return res.status(400).json({ message: "Il nome non può superare i 100 caratteri" });
    }
    if (cognome && cognome.length > 100) {
      return res.status(400).json({ message: "Il cognome non può superare i 100 caratteri" });
    }

    let fieldsToUpdate = [];
    let values = [];
    if (email) { fieldsToUpdate.push('email = ?'); values.push(email); }
    if (nome) { fieldsToUpdate.push('nome = ?'); values.push(nome); }
    if (cognome) { fieldsToUpdate.push('cognome = ?'); values.push(cognome); }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: "Nessun dato da aggiornare fornito" });
    }

    values.push(id);
    const sql = "UPDATE users SET " + fieldsToUpdate.join(', ') + " WHERE id = ?";

    const database = await getDB();
    const [result] = await database.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    
    const [updatedUsers] = await database.execute('SELECT id, email, nome, cognome, created_at FROM users WHERE id = ?', [id]);
    
    logger.info(`Utente aggiornato: ID ${id}`);
    
    res.status(200).json(updatedUsers[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      logger.warn("Tentativo di aggiornare con email duplicata");
      return res.status(400).json({ message: "L'email è già in uso" });
    }
    logger.error(`Errore aggiornamento utente: ${error.message}`);
    res.status(500).json({ message: "Errore durante l'aggiornamento dell'utente", error: error.message });
  }
};

/**
 * @desc    Elimina utente
 * @route   DELETE /api/users/:id
 * @access  Public
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await database.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    
    logger.info(`Utente eliminato: ID ${id}`);
   
    res.status(204).send(); 
  } catch (error) {
    logger.error(`Errore eliminazione utente: ${error.message}`);
    res.status(500).json({ message: "Errore durante la cancellazione dell'utente", error: error.message });
  }
};
