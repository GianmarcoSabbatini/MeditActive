const express = require('express');
const router = express.Router();
const intervalController = require('../controllers/interval.controller');

// Definizione delle rotte e associazione alle funzioni del controller

// GET /api/intervals - Ottiene tutti gli intervalli (con filtri opzionali)
router.get('/', intervalController.getAllIntervals);

// POST /api/intervals - Crea un nuovo intervallo
router.post('/', intervalController.createInterval);

// GET /api/intervals/:id - Ottiene un intervallo specifico
router.get('/:id', intervalController.getIntervalById);

// PUT /api/intervals/:id - Aggiorna un intervallo specifico
router.put('/:id', intervalController.updateInterval);

// DELETE /api/intervals/:id - Cancella un intervallo specifico
router.delete('/:id', intervalController.deleteInterval);

// POST /api/intervals/:id/obiettivi - Aggiunge un obiettivo a un intervallo
router.post('/:id/obiettivi', intervalController.addGoalToInterval);

module.exports = router;

