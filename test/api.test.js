const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

// TEST UNIT PROFESSIONALI CON MOCHA, CHAI E SINON
// Questi test seguono gli standard richiesti in ambito professionale

describe('MeditActive API - Unit Tests', () => {
  let dbModule, getDBStub, dbMock;
  
  before(() => { dbModule = require('../config/db'); });
  beforeEach(() => {
    dbMock = { execute: sinon.stub() };
    getDBStub = sinon.stub(dbModule, 'getDB').resolves(dbMock);
  });
  afterEach(() => { sinon.restore(); });

  describe('User Controller', () => {
    const userController = require('../controllers/user.controller');
    let req, res;

    beforeEach(() => {
      req = { body: {}, params: {}, query: {} };
      res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis(), send: sinon.stub().returnsThis() };
    });

    it('dovrebbe creare un utente con successo', async () => {
      req.body = { email: 'test@example.com', nome: 'Mario', cognome: 'Rossi' };
      dbMock.execute.resolves([{ insertId: 1 }]);
      await userController.createUser(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('dovrebbe restituire 400 se manca email', async () => {
      req.body = { nome: 'Mario', cognome: 'Rossi' };
      await userController.createUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe gestire email duplicate', async () => {
      req.body = { email: 'test@example.com', nome: 'Test', cognome: 'User' };
      const err = new Error('Duplicate'); err.code = 'ER_DUP_ENTRY';
      dbMock.execute.rejects(err);
      await userController.createUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('dovrebbe ottenere tutti gli utenti', async () => {
      dbMock.execute.resolves([[{ id: 1, email: 'test@example.com' }]]);
      await userController.getAllUsers(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe ottenere utente per ID', async () => {
      req.params.id = '1';
      dbMock.execute.resolves([[{ id: 1, email: 'test@example.com' }]]);
      await userController.getUserById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe restituire 404 per utente non esistente', async () => {
      req.params.id = '999';
      dbMock.execute.resolves([[]]);
      await userController.getUserById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('dovrebbe aggiornare un utente', async () => {
      req.params.id = '1';
      req.body = { nome: 'Updated' };
      dbMock.execute.onFirstCall().resolves([{ affectedRows: 1 }]);
      dbMock.execute.onSecondCall().resolves([[{ id: 1, nome: 'Updated' }]]);
      await userController.updateUser(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe eliminare un utente', async () => {
      req.params.id = '1';
      dbMock.execute.resolves([{ affectedRows: 1 }]);
      await userController.deleteUser(req, res);
      expect(res.status.calledWith(204)).to.be.true;
    });
  });

  describe('Interval Controller', () => {
    const intervalController = require('../controllers/interval.controller');
    let req, res;

    beforeEach(() => {
      req = { body: {}, params: {}, query: {} };
      res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis(), send: sinon.stub().returnsThis() };
    });

    it('dovrebbe creare un intervallo con successo', async () => {
      req.body = { dataInizio: '2024-01-01', dataFine: '2024-01-31', utenteId: 1 };
      dbMock.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbMock.execute.onCall(1).resolves([{ insertId: 1 }]);
      dbMock.execute.onCall(2).resolves([[{ id: 1 }]]);
      dbMock.execute.onCall(3).resolves([[]]);
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
      dbMock.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbMock.execute.onCall(1).resolves([[]]);
      await intervalController.getAllIntervals(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe aggiungere obiettivo a intervallo', async () => {
      req.params.id = '1';
      req.body = { obiettivo: 'Meditare 10 minuti' };
      dbMock.execute.onCall(0).resolves([[{ id: 1 }]]);
      dbMock.execute.onCall(1).resolves([{ insertId: 1 }]);
      dbMock.execute.onCall(2).resolves([[{ id: 1 }]]);
      dbMock.execute.onCall(3).resolves([[{ goal_name: 'Meditare 10 minuti' }]]);
      await intervalController.addGoalToInterval(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('dovrebbe eliminare un intervallo', async () => {
      req.params.id = '1';
      dbMock.execute.resolves([{ affectedRows: 1 }]);
      await intervalController.deleteInterval(req, res);
      expect(res.status.calledWith(204)).to.be.true;
    });
  });
});
