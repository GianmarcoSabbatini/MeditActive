const express = require('express');
const dotenv = require('dotenv');

const userRoutes = require('./routes/user.routes');
const intervalRoutes = require('./routes/interval.routes');
const db = require('./config/db');


dotenv.config();


const app = express();


app.use(express.json());


const PORT = process.env.PORT || 3000;


app.use('/api/users', userRoutes);

app.use('/api/intervals', intervalRoutes);


app.get('/', (req, res) => {
  res.send('Benvenuto nelle API di MeditActive!');
});


const startServer = async () => {
    try {
        await db.initDB();
        console.log('Connesso con successo al database MySQL.');
        app.listen(PORT, () => {
            console.log(`Server in ascolto sulla porta ${PORT}`);
        });
    } catch (error) {
        console.error("Impossibile connettersi al database:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;

