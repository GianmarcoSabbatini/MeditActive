const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Definizione delle rotte e associazione alle funzioni del controller

// GET /api/users - Ottiene tutti gli utenti
router.get('/', userController.getAllUsers);

// POST /api/users - Crea un nuovo utente
router.post('/', userController.createUser);

// GET /api/users/:id - Ottiene un utente specifico
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Aggiorna un utente specifico
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Cancella un utente specifico
router.delete('/:id', userController.deleteUser);

module.exports = router;

