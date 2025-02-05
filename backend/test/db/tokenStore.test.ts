import 'mocha';
import { expect } from 'chai';
import { addToBlacklist, isTokenBlacklisted, getTokenVersion, incrementTokenVersion, TokenVersion } from '../../src/db/tokenStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';

const testUserId = 'testUserId';
const testToken = 'testToken';

describe('Token Store Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    it('should add a token to the blacklist', async () => {
        await addToBlacklist(testToken);
        const isBlacklisted = await isTokenBlacklisted(testToken);
        expect(isBlacklisted).to.be.true;
    });

    it('should return false for a non-blacklisted token', async () => {
        const isBlacklisted = await isTokenBlacklisted('nonExistentToken');
        expect(isBlacklisted).to.be.false;
    });

    it('should return the correct token version', async () => {
        await TokenVersion.create({ userId: testUserId, version: 1 });
        const version = await getTokenVersion(testUserId);
        expect(version).to.equal(1);
    });

    it('should increment the token version', async () => {
        await TokenVersion.create({ userId: testUserId, version: 1 });
        await incrementTokenVersion(testUserId);
        const version = await getTokenVersion(testUserId);
        expect(version).to.equal(2);
    });

    it('should throw an error if token version record does not exist', async () => {
        try {
            await incrementTokenVersion('nonExistentUser');
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err).to.exist;
            expect(err.message).to.include('Token version record not found');
        }
    });
});
