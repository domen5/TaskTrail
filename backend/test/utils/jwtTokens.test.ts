import 'mocha';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { newToken } from '../../src/utils/jwtTokens';
import { JWT_SECRET } from '../../src/config';

const testUser = {
    _id: '12345',
    username: 'testuser',
    exp: 30 * 60 * 1000 // 30 minutes
};

describe('JWT Token Utility Tests', () => {
    it('should generate a valid token', async () => {
        const token = await newToken(testUser, JWT_SECRET);
        expect(token).to.not.be.empty;
    });

    it('should contain the correct payload', async () => {
        const token = await newToken(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('_id', testUser._id);
        expect(decoded).to.have.property('username', testUser.username);
    });

    it('should set the expiration correctly', async () => {
        const token = await newToken(testUser, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded).to.have.property('exp');
        expect(decoded.exp).to.be.above(0);
    });
}); 