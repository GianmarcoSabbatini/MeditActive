const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log dell'errore
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode || 500,
  });

  // Errori operazionali
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Errori MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      status: 'error',
      message: 'Valore duplicato: questo record esiste già',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      status: 'error',
      message: 'Riferimento non valido: verifica che tutti i riferimenti esistano',
    });
  }

  // Errori non gestiti
  logger.error('ERRORE NON GESTITO:', err);
  
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Errore interno del server' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};


const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route non trovata: ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
