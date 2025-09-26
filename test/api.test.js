const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server'); // Importa il tuo server Express
const db = require('../config/db'); // Importa il pool di connessione al DB

const expect = chai.expect;
chai.use(chaiHttp);

describe('MeditActive API Tests', () => {
  let dbStub;

  // Prima di ogni test, creiamo uno "stub" (un finto metodo) per db.execute
  // In questo modo, le chiamate al database non avverranno realmente, ma restituiranno ciò che vogliamo noi.
  beforeEach(() => {
    dbStub = sinon.stub(db, 'execute');
  });

  // Dopo ogni test, ripristiniamo il metodo originale
  afterEach(() => {
    dbStub.restore();
  });

  // --- Test per le API degli Utenti ---
  describe('API Utenti - /api/users', () => {
    
    it('dovrebbe creare un nuovo utente con successo', (done) => {
      const newUser = { email: 'test@example.com', nome: 'Test', cognome: 'User' };
      // Quando db.execute viene chiamato, simula una risposta di successo
      dbStub.resolves([{ insertId: 1 }]); 
      
      chai.request(server)
        .post('/api/users')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('email', newUser.email);
          done();
        });
    });

    it('dovrebbe restituire un errore se mancano dei campi', (done) => {
        chai.request(server)
          .post('/api/users')
          .send({ email: 'test@example.com' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message');
            done();
          });
    });

    it('dovrebbe ottenere tutti gli utenti', (done) => {
      const mockUsers = [[{ id: 1, email: 'test@example.com' }]];
      dbStub.resolves(mockUsers);

      chai.request(server)
        .get('/api/users')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.eql(1);
          done();
        });
    });

    it('dovrebbe cancellare un utente', (done) => {
        // Simula che la cancellazione abbia avuto successo (1 riga affetta)
        dbStub.resolves([{ affectedRows: 1 }]);
        chai.request(server)
          .delete('/api/users/1')
          .end((err, res) => {
            expect(res).to.have.status(204);
            done();
          });
    });

    it('dovrebbe restituire 404 se si prova a cancellare un utente che non esiste', (done) => {
        dbStub.resolves([{ affectedRows: 0 }]);
        chai.request(server)
          .delete('/api/users/999')
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
    });

  });


  // --- Test per le API degli Intervalli ---
  describe('API Intervalli - /api/intervals', () => {

    it('dovrebbe creare un nuovo intervallo', (done) => {
      const newInterval = { dataInizio: '2024-01-01', dataFine: '2024-01-31', utenteId: 1 };
      // 1. Simula il controllo dell'esistenza dell'utente
      dbStub.withArgs('SELECT id FROM users WHERE id = ?', [1]).resolves([[{id: 1}]]);
      // 2. Simula l'inserimento dell'intervallo
      dbStub.withArgs('INSERT INTO intervals (start_date, end_date, user_id) VALUES (?, ?, ?)', [newInterval.dataInizio, newInterval.dataFine, newInterval.utenteId]).resolves([{ insertId: 10 }]);
      // 3. Simula il recupero dei dati per la risposta
      dbStub.withArgs(sinon.match.string, [10]).resolves([[{ id: 10, ...newInterval }], []]);

      chai.request(server)
        .post('/api/intervals')
        .send(newInterval)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id', 10);
          done();
        });
    });

    it('dovrebbe aggiungere un obiettivo a un intervallo', (done) => {
      const goal = { obiettivo: 'Meditare 10 minuti' };
      // Simula i vari passaggi del DB
      dbStub.withArgs('SELECT id FROM intervals WHERE id = ?', [10]).resolves([[{id:10}]]);
      dbStub.withArgs('INSERT INTO interval_goals (interval_id, goal_name) VALUES (?, ?)', [10, goal.obiettivo]).resolves([{}]);
      dbStub.withArgs(sinon.match.string, [10]).resolves([[{ id: 10 }], [{goal_name: goal.obiettivo}]]);

      chai.request(server)
        .post('/api/intervals/10/obiettivi')
        .send(goal)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.obiettivi).to.include(goal.obiettivo);
          done();
        });
    });
    
    it('dovrebbe filtrare gli intervalli per obiettivo', (done) => {
        const mockResponse = [[
            { id: 1, obiettivi: 'obiettivo1,obiettivo2' }
        ]];
        // Simula la query complessa di filtraggio
        dbStub.resolves(mockResponse);

        chai.request(server)
        .get('/api/intervals?obiettivi=obiettivo1')
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body[0].obiettivi).to.include('obiettivo1');
            done();
        });
    });

  });

});

