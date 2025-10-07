const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;


describe('MeditActive API - Unit Tests con Mocha/Chai/Sinon', () => {
  
  describe('User Controller - Test di Validazione', () => {
    let userController;
    let req, res;
    let dbStub;

    beforeEach(() => {
      delete require.cache[require.resolve('../../controllers/user.controller')];
      delete require.cache[require.resolve('../../config/db')];
      
      const db = require('../../config/db');
      dbStub = { execute: sinon.stub() };
      sinon.stub(db, 'getDB').resolves(dbStub);
      
      userController = require('../../controllers/user.controller');
      
      req = { body: {}, params: {}, query: {} };
      res = { 
        status: sinon.stub().returnsThis(), 
        json: sinon.stub().returnsThis(), 
        send: sinon.stub().returnsThis() 
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('dovrebbe creare un utente con successo', async () => {
      req.body = { email: 'test@example.com', nome: 'Mario', cognome: 'Rossi' };
      dbStub.execute.resolves([{ insertId: 1 }]);
      
      await userController.createUser(req, res);
      
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('id', 1);
      expect(response).to.have.property('email', 'test@example.com');
    });

    it('dovrebbe restituire 400 se manca email', async () => {
      req.body = { nome: 'Mario', cognome: 'Rossi' };
      await userController.createUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe restituire 400 se manca nome', async () => {
      req.body = { email: 'test@example.com', cognome: 'Rossi' };
      await userController.createUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe restituire 400 se manca cognome', async () => {
      req.body = { email: 'test@example.com', nome: 'Mario' };
      await userController.createUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe gestire email duplicate (ER_DUP_ENTRY)', async () => {
      req.body = { email: 'test@example.com', nome: 'Test', cognome: 'User' };
      const err = new Error('Duplicate'); 
      err.code = 'ER_DUP_ENTRY';
      dbStub.execute.rejects(err);
      
      await userController.createUser(req, res);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.getCall(0).args[0].message).to.include('già in uso');
    });

    it('dovrebbe ottenere tutti gli utenti', async () => {
      dbStub.execute.resolves([[{ id: 1, email: 'test@example.com', nome: 'Test', cognome: 'User' }]]);
      
      await userController.getAllUsers(req, res);
      
      expect(res.status.calledWith(200)).to.be.true;
      expect(dbStub.execute.calledOnce).to.be.true;
    });

    it('dovrebbe ottenere utente per ID', async () => {
      req.params.id = '1';
      dbStub.execute.resolves([[{ id: 1, email: 'test@example.com' }]]);
      
      await userController.getUserById(req, res);
      
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe restituire 404 per utente non esistente', async () => {
      req.params.id = '999';
      dbStub.execute.resolves([[]]);
      
      await userController.getUserById(req, res);
      
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('dovrebbe aggiornare un utente', async () => {
      req.params.id = '1';
      req.body = { nome: 'Updated' };
      dbStub.execute.onFirstCall().resolves([{ affectedRows: 1 }]);
      dbStub.execute.onSecondCall().resolves([[{ id: 1, nome: 'Updated' }]]);
      
      await userController.updateUser(req, res);
      
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe eliminare un utente', async () => {
      req.params.id = '1';
      dbStub.execute.resolves([{ affectedRows: 1 }]);
      
      await userController.deleteUser(req, res);
      
      expect(res.status.calledWith(204)).to.be.true;
    });
  });

  describe('Interval Controller - Test di Validazione', () => {
    let intervalController;
    let req, res;
    let dbStub;

    beforeEach(() => {
      delete require.cache[require.resolve('../../controllers/interval.controller')];
      delete require.cache[require.resolve('../../config/db')];
      
      const db = require('../../config/db');
      dbStub = { execute: sinon.stub() };
      sinon.stub(db, 'getDB').resolves(dbStub);
      
      intervalController = require('../../controllers/interval.controller');
      
      req = { body: {}, params: {}, query: {} };
      res = { 
        status: sinon.stub().returnsThis(), 
        json: sinon.stub().returnsThis(), 
        send: sinon.stub().returnsThis() 
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('dovrebbe creare un intervallo con successo', async () => {
      req.body = { dataInizio: '2024-01-01', dataFine: '2024-01-31', utenteId: 1 };
      
      dbStub.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbStub.execute.onCall(1).resolves([{ insertId: 1 }]);
      dbStub.execute.onCall(2).resolves([[{ id: 1, start_date: '2024-01-01' }]]);
      dbStub.execute.onCall(3).resolves([[]]);
      
      await intervalController.createInterval(req, res);
      
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('dovrebbe restituire 400 se manca dataInizio', async () => {
      req.body = { dataFine: '2024-01-31', utenteId: 1 };
      await intervalController.createInterval(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe restituire 400 se dataFine < dataInizio', async () => {
      req.body = { dataInizio: '2024-12-31', dataFine: '2024-01-01', utenteId: 1 };
      await intervalController.createInterval(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe ottenere tutti gli intervalli', async () => {
      dbStub.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbStub.execute.onCall(1).resolves([[]]);
      
      await intervalController.getAllIntervals(req, res);
      
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe aggiungere obiettivo a intervallo', async () => {
      req.params.id = '1';
      req.body = { obiettivo: 'Meditare 10 minuti' };
      
      dbStub.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbStub.execute.onCall(1).resolves([{ insertId: 1 }]);
      dbStub.execute.onCall(2).resolves([[{ id: 1 }]]);
      dbStub.execute.onCall(3).resolves([[{ goal_name: 'Meditare 10 minuti' }]]);
      
      await intervalController.addGoalToInterval(req, res);
      
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe eliminare un intervallo', async () => {
      req.params.id = '1';
      dbStub.execute.resolves([{ affectedRows: 1 }]);
      
      await intervalController.deleteInterval(req, res);
      
      expect(res.status.calledWith(204)).to.be.true;
    });
  });
});
