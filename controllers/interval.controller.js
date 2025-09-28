const { getDB } = require('../config/db');

// recupera un interval completo
const getIntervalWithGoals = async (id) => {
  const database = await getDB();
  const intervalSql = `
    SELECT 
      i.id, i.start_date, i.end_date,
      i.user_id, u.email AS user_email, u.nome AS user_nome, u.cognome AS user_cognome 
    FROM intervals i
    JOIN users u ON i.user_id = u.id
    WHERE i.id = ?
  `;
  const goalsSql = 'SELECT goal_name FROM interval_goals WHERE interval_id = ?';

  const [intervals] = await database.execute(intervalSql, [id]);
  const interval = intervals[0];
  if (!interval) return null;

  const [goals] = await database.execute(goalsSql, [id]);
  
  interval.obiettivi = goals.map(g => g.goal_name);
  
  return interval;
};

// crea nuovo interval
exports.createInterval = async (req, res) => {
  try {
    const { dataInizio, dataFine, utenteId } = req.body;
    if (!dataInizio || !dataFine || !utenteId) {
      return res.status(400).json({ message: "dataInizio, dataFine e utenteId sono campi obbligatori." });
    }
    if (new Date(dataFine) < new Date(dataInizio)) {
        return res.status(400).json({ message: 'La data di fine non può essere precedente alla data di inizio.' });
    }

    const database = await getDB();
    const [users] = await database.execute('SELECT id FROM users WHERE id = ?', [utenteId]);
    const user = users[0];
    if(!user) {
        return res.status(404).json({ message: "Utente specificato non trovato." });
    }

    const sql = 'INSERT INTO intervals (start_date, end_date, user_id) VALUES (?, ?, ?)';
    const [result] = await database.execute(sql, [dataInizio, dataFine, utenteId]);
    
    const createdInterval = await getIntervalWithGoals(result.insertId);
    res.status(201).json(createdInterval);
  } catch (error) {
    res.status(500).json({ message: "Errore durante la creazione dell'intervallo.", error: error.message });
  }
};

// tutti gli interval
exports.getAllIntervals = async (req, res) => {
  try {
    const { obiettivi, dataInizio, dataFine } = req.query;
    const database = await getDB();
    
    let baseSql = `
        SELECT 
            i.id, i.start_date, i.end_date, i.user_id,
            u.email, u.nome, u.cognome
        FROM intervals i
        JOIN users u ON i.user_id = u.id
    `;
    
    let whereConditions = [];
    let params = [];
    
    // Filtro per data inizio
    if (dataInizio) {
      whereConditions.push('i.start_date >= ?');
      params.push(dataInizio);
    }
    
    // Filtro per data fine
    if (dataFine) {
      whereConditions.push('i.end_date <= ?');
      params.push(dataFine);
    }
    
    // Filtro per obiettivi
    if (obiettivi) {
      baseSql = `
        SELECT DISTINCT
            i.id, i.start_date, i.end_date, i.user_id,
            u.email, u.nome, u.cognome
        FROM intervals i
        JOIN users u ON i.user_id = u.id
        JOIN interval_goals ig ON i.id = ig.interval_id
      `;
      whereConditions.push('ig.goal_name LIKE ?');
      params.push(`%${obiettivi}%`);
    }
    
    if (whereConditions.length > 0) {
      baseSql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    baseSql += ' ORDER BY i.created_at DESC';
    
    const [intervals] = await database.execute(baseSql, params);
    
    // Aggiungi obiettivi per ogni intervallo
    for (let interval of intervals) {
      const [goals] = await database.execute('SELECT goal_name FROM interval_goals WHERE interval_id = ?', [interval.id]);
      interval.obiettivi = goals.map(g => g.goal_name);
    }
    
    res.status(200).json(intervals);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero degli intervalli.", error: error.message });
  }
};

// recupera un interval specifico
exports.getIntervalById = async (req, res) => {
  try {
    const { id } = req.params;
    const interval = await getIntervalWithGoals(id);
    if (!interval) {
      return res.status(404).json({ message: "Intervallo non trovato." });
    }
    res.status(200).json(interval);
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero dell'intervallo.", error: error.message });
  }
};

// aggiorna un interval
exports.updateInterval = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataInizio, dataFine } = req.body;

        if(!dataInizio && !dataFine) {
            return res.status(400).json({ message: "Nessun dato da aggiornare fornito." });
        }
        
        const database = await getDB();
        const [intervals] = await database.execute('SELECT start_date, end_date FROM intervals WHERE id = ?', [id]);
        const currentInterval = intervals[0];
        if(!currentInterval) {
             return res.status(404).json({ message: "Intervallo non trovato." });
        }

        const newStartDate = dataInizio || currentInterval.start_date;
        const newEndDate = dataFine || currentInterval.end_date;

        const sql = 'UPDATE intervals SET start_date = ?, end_date = ? WHERE id = ?';
        const [result] = await database.execute(sql, [newStartDate, newEndDate, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Intervallo non trovato." });
        }
        
        const updatedInterval = await getIntervalWithGoals(id);
        res.status(200).json(updatedInterval);
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'aggiornamento dell'intervallo.", error: error.message });
    }
};

// cancella interval
exports.deleteInterval = async (req, res) => {
  try {
    const { id } = req.params;
    const database = await getDB();
    const [result] = await database.execute('DELETE FROM intervals WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Intervallo non trovato." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Errore durante la cancellazione dell'intervallo.", error: error.message });
  }
};

// aggiungi obiettivo a interval
exports.addGoalToInterval = async (req, res) => {
  try {
    const { id: interval_id } = req.params;
    const { obiettivo } = req.body;
    if (!obiettivo) {
      return res.status(400).json({ message: "Il campo 'obiettivo' è obbligatorio." });
    }

    const database = await getDB();
    const [intervals] = await database.execute('SELECT id FROM intervals WHERE id = ?', [interval_id]);
    const interval = intervals[0];
    if(!interval) {
        return res.status(404).json({ message: 'Intervallo non trovato.' });
    }

    const sql = 'INSERT INTO interval_goals (interval_id, goal_name) VALUES (?, ?)';
    await database.execute(sql, [interval_id, obiettivo]);
    
    const updatedInterval = await getIntervalWithGoals(interval_id);
    res.status(200).json(updatedInterval);
  } catch (error) {
    res.status(500).json({ message: "Errore durante l'aggiunta dell'obiettivo.", error: error.message });
  }
};
