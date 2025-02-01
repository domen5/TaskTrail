import 'mocha';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { makeJwt } from '../../src/utils/auth';
import { JWT_SECRET } from '../../src/config';

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
