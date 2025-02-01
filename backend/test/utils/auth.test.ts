import 'mocha';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { makeJwt, verifyToken } from '../../src/utils/auth';
import { JWT_SECRET } from '../../src/config';
import { Request, Response } from 'express';
import sinon from 'sinon';

const testUser = {
    _id: '12345',
    username: 'testuser',
    exp: 30 * 60 * 1000 // 30 minutes
};

describe('JWT Token Utility Tests', () => {
    it('should generate a valid token', async () => {
        const token = await makeJwt(testUser, JWT_SECRET);
        expect(token).to.not.be.empty;
    });

    it('should contain the correct payload', async () => {
        const token = await makeJwt(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('_id', testUser._id);
        expect(decoded).to.have.property('username', testUser.username);
    });

    it('should set the expiration correctly', async () => {
        const token = await makeJwt(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('exp');
        expect(decoded.exp).to.be.above(0);
    });

    it('should throw an error with empty secret', async () => {
        try {
            await makeJwt(testUser, '');
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err).to.exist;
            expect(err.message).to.include('Secret is empty');
        }

    });

    it('should throw an error with missing payload fields', async () => {
        const incompleteUser = { _id: '12345' };
        try {
            await makeJwt(incompleteUser as any, JWT_SECRET);
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err).to.exist;
            expect(err.message).to.include('Missing payload fields');
        }
    });
});

describe('verifyToken Middleware Tests', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: sinon.SinonSpy;

    beforeEach(() => {
        req = { headers: {} } as Partial<Request>;
        res = {
            status: sinon.stub().returnsThis() as any,
            send: sinon.stub() as any
        };
        next = sinon.spy();
    });

    it('should return 401 if no token is provided', async () => {
        await verifyToken(req as Request, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Access Denied: No Token Provided!' })).to.be.true;
    });

    it('should return 400 if token is invalid', async () => {
        req.headers = { authorization: 'Bearer invalidtoken' };
        await verifyToken(req as Request, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(400)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Invalid Token' })).to.be.true;
    });

    it('should call next if token is valid', async () => {
        const validToken = await makeJwt(testUser, JWT_SECRET);
        req.headers = { authorization: `Bearer ${validToken}` };
        await verifyToken(req as Request, res as Response, next);
        expect(next.calledOnce).to.be.true;
    });
});
