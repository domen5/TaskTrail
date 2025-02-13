import 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Types } from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { makeToken } from '../../src/utils/auth';
import { JWT_SECRET } from '../../src/config';
import { TokenVersion } from '../../src/db/tokenStore';
import { UserModel } from '../../src/models/User';
import accountantRoutes from '../../src/api/accountantRoutes';
import { LockedMonthModel } from '../../src/models/LockedMonth';

describe('Accountant Routes Tests', () => {
    let app: express.Express;
    let accountantToken: string;
    let regularUserToken: string;
    const accountantId = new Types.ObjectId().toString();
    const regularUserId = new Types.ObjectId().toString();
    const orgId = new Types.ObjectId().toString();

    before(async () => {
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        await TokenVersion.create({ userId: accountantId, version: 1 });
        await TokenVersion.create({ userId: regularUserId, version: 1 });

        accountantToken = await makeToken({
            _id: accountantId,
            username: 'accountant',
            exp: 1000 * 60 * 60,
            version: 1
        }, JWT_SECRET);

        regularUserToken = await makeToken({
            _id: regularUserId,
            username: 'regular',
            exp: 1000 * 60 * 60,
            version: 1
        }, JWT_SECRET);

        app.use('/api/accountant', accountantRoutes);
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        await TokenVersion.create({ userId: accountantId, version: 1 });
        await TokenVersion.create({ userId: regularUserId, version: 1 });

        await UserModel.create({
            _id: accountantId,
            userId: accountantId,
            username: 'accountant',
            role: 'accountant',
            organization: orgId,
            password: 'hashedPassword'
        });
        await UserModel.create({
            _id: regularUserId,
            userId: regularUserId,
            username: 'regular',
            role: 'regular',
            organization: orgId,
            password: 'hashedPassword'
        });
    });

    describe('POST /:year/:month/:userId/lock', () => {
        it('should successfully lock a month for a user', async () => {
            const response = await supertest(app)
                .post(`/api/accountant/2024/3/${regularUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(200);

            expect(response.body).to.have.property('message', 'Month locked successfully');

            const lock = await LockedMonthModel.findOne({
                userId: regularUserId,
                year: 2024,
                month: 3
            });

            expect(lock).to.exist;
            expect(lock?.lockedBy.toString()).to.equal(accountantId);
        });

        it('should not throw error when locking the same month twice', async () => {
            await supertest(app)
                .post(`/api/accountant/2024/3/${regularUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(200);

            const response = await supertest(app)
                .post(`/api/accountant/2024/3/${regularUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(200);

            expect(response.body).to.have.property('message', 'Month locked successfully');
        });

        it('should return 400 for invalid year/month', async () => {
            const response = await supertest(app)
                .post(`/api/accountant/2024/13/${regularUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(400);

            expect(response.body).to.have.property('message');
        });

        it('should return 400 for invalid user ID format', async () => {
            const response = await supertest(app)
                .post('/api/accountant/2024/3/invalid-id/lock')
                .set('Cookie', [`token=${accountantToken}`])
                .expect(400);

            expect(response.body).to.have.property('message', 'Invalid user ID format');
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentUserId = new Types.ObjectId().toString();
            const response = await supertest(app)
                .post(`/api/accountant/2024/3/${nonExistentUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(404);

            expect(response.body).to.have.property('message', 'User not found');
        });

        it('should return 403 when non-accountant tries to lock month', async () => {
            const response = await supertest(app)
                .post(`/api/accountant/2024/3/${regularUserId}/lock`)
                .set('Cookie', [`token=${regularUserToken}`])
                .expect(403);

            expect(response.body).to.have.property('message', 'Access Denied: You are not authorized to perform this action');
        });

        it('should return 403 when accountant tries to lock month for user from different organization', async () => {
            // Create user from different organization
            const differentOrgId = new Types.ObjectId().toString();
            const differentOrgUserId = new Types.ObjectId().toString();
            await UserModel.create({
                _id: differentOrgUserId,
                username: 'different-org-user',
                role: 'regular',
                organization: differentOrgId,
                password: 'hashedPassword'
            });

            const response = await supertest(app)
                .post(`/api/accountant/2024/3/${differentOrgUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(403);

            expect(response.body).to.have.property('message', 'Access Denied: You are not authorized to perform this action');
        });

        it('should return 400 when trying to lock a future month', async () => {
            const currentDate = new Date();
            const futureYear = currentDate.getFullYear() + 1;

            const response = await supertest(app)
                .post(`/api/accountant/${futureYear}/1/${regularUserId}/lock`)
                .set('Cookie', [`token=${accountantToken}`])
                .expect(400);

            expect(response.body).to.have.property('message', 'Cannot lock or unlock future months');
        });
    });
});
