import 'mocha';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { makeToken, verifyToken } from '../../src/utils/auth';
import { JWT_SECRET } from '../../src/config';
import { Response } from 'express';
import sinon from 'sinon';
import { addToBlacklist, incrementTokenVersion } from '../../src/db/tokenStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { TokenVersion } from '../../src/db/tokenStore';
import { AuthRequest } from '../../src/types/auth';

const testUser = {
    _id: '12345',
    username: 'testuser',
    exp: 30 * 60 * 1000, // 30 minutes
    version: 1
};

describe('JWT Token Utility Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        await TokenVersion.create({ userId: testUser._id, version: 1 }); // Ensure TokenVersion document exists
    });

    it('should generate a valid token', async () => {
        const token = await makeToken(testUser, JWT_SECRET);
        expect(token).to.not.be.empty;
    });

    it('should contain the correct payload', async () => {
        const token = await makeToken(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('_id', testUser._id);
        expect(decoded).to.have.property('username', testUser.username);
    });

    it('should set the expiration correctly', async () => {
        const token = await makeToken(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('exp');
        expect(decoded.exp).to.be.above(0);
    });

    it('should throw an error with empty secret', async () => {
        try {
            await makeToken(testUser, '');
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err).to.exist;
            expect(err.message).to.include('Secret is empty');
        }
    });

    it('should throw an error with missing payload fields', async () => {
        const incompleteUser = { _id: '12345' };
        try {
            await makeToken(incompleteUser as any, JWT_SECRET);
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err).to.exist;
            expect(err.message).to.include('Missing payload fields');
        }
    });
});

describe('verifyToken Middleware Tests', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: sinon.SinonSpy;

    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        req = { cookies: {} } as Partial<AuthRequest>;
        res = {
            status: sinon.stub().returnsThis() as any,
            send: sinon.stub() as any
        };
        next = sinon.spy();
    });

    it('should return 401 if no token is provided', async () => {
        await verifyToken(req as AuthRequest, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Access Denied: No Token Provided!' })).to.be.true;
    });

    it('should return 400 if token is invalid', async () => {
        req.cookies = { token: 'invalidtoken' };
        await verifyToken(req as AuthRequest, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(400)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Invalid Token' })).to.be.true;
    });

    it('should call next if token is valid', async () => {
        await TokenVersion.create({ userId: testUser._id, version: 1 });
        const validToken = await makeToken(testUser, JWT_SECRET);
        req.cookies = { token: validToken };
        await verifyToken(req as AuthRequest, res as Response, next);
        expect(next.calledOnce).to.be.true;
        expect(req.user).to.exist;
        expect(req.user?._id).to.equal(testUser._id);
        expect(req.user?.username).to.equal(testUser.username);
        expect(req.user?.version).to.equal(testUser.version);
    });

    it('should return 401 if token is blacklisted', async () => {
        await TokenVersion.create({ userId: testUser._id, version: 1 });
        const validToken = await makeToken(testUser, JWT_SECRET);
        await addToBlacklist(validToken);
        req.cookies = { token: validToken };
        await verifyToken(req as AuthRequest, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Access Denied: Token is blacklisted!' })).to.be.true;
    });

    it('should return 401 if token version is outdated', async () => {
        await TokenVersion.create({ userId: testUser._id, version: 1 });
        const validToken = await makeToken(testUser, JWT_SECRET);
        req.cookies = { token: validToken };
        await incrementTokenVersion(testUser._id);
        await verifyToken(req as AuthRequest, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Access Denied: Token version is outdated!' })).to.be.true;
    });

    it('should return 500 if token version record is missing', async () => {
        const validToken = await makeToken(testUser, JWT_SECRET);
        req.cookies = { token: validToken };
        await verifyToken(req as AuthRequest, res as Response, next);
        expect((res.status as sinon.SinonStub).calledWith(500)).to.be.true;
        expect((res.send as sinon.SinonStub).calledWith({ message: 'Internal Server Error: Token version record missing' })).to.be.true;
    });
});
