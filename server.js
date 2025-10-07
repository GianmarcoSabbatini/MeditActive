const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const logger = require('./config/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/user.routes');
const intervalRoutes = require('./routes/interval.routes');
const db = require('./config/db');

dotenv.config();

const app = express();

// Middleware per parsing JSON
app.use(express.json());

// Logging Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

const PORT = process.env.PORT || 3000;

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Benvenuto nelle API di MeditActive!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      intervals: '/api/intervals',
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/intervals', intervalRoutes);


app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async () => {
    try {
        await db.initDB();
        logger.info('✓ Connesso con successo al database MySQL');
        app.listen(PORT, () => {
            logger.info(`✓ Server in ascolto sulla porta ${PORT}`);
            logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('✗ Impossibile connettersi al database:', error);
        process.exit(1);
    }
};

// Gestione errori non catturati
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app;

