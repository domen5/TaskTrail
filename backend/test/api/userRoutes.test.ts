import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { OrganizationModel } from '../../src/models/Organization';
import { UserModel, Role } from '../../src/models/User';
import { Types } from 'mongoose';
import userRoutes from '../../src/routes/userRoutes';

describe('User API Routes', () => {
    let testOrgId: Types.ObjectId;
    let app: express.Express;
    const testRole: Role = 'regular';

    before(async () => {
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use('/api/user', userRoutes);
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        const org = await OrganizationModel.create({ name: 'testorganization' });
        testOrgId = org._id;
    });

    describe('POST /api/user/register', () => {
        const validUserData = {
            username: 'testuser',
            password: 'testpassword',
            organizationId: '',  // Will be set in beforeEach
            role: 'regular' as Role
        };

        beforeEach(() => {
            validUserData.organizationId = testOrgId.toString();
        });

        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/user/register')
                .send(validUserData);

            expect(response.status).to.equal(201);
            expect(response.body.message).to.equal('User registered successfully');

            const user = await UserModel.findOne({ username: 'testuser' });
            expect(user).to.exist;
            expect(user?.organization.toString()).to.equal(testOrgId.toString());
            expect(user?.role).to.equal('regular');
        });

        it('should return 400 for missing required fields', async () => {
            const testCases = [
                { ...validUserData, username: undefined },
                { ...validUserData, password: undefined },
                { ...validUserData, organizationId: undefined },
                { ...validUserData, role: undefined }
            ];

            for (const testCase of testCases) {
                const response = await request(app)
                    .post('/api/user/register')
                    .send(testCase);

                expect(response.status).to.equal(400);
                expect(response.body.message).to.equal('Invalid request body');
            }
        });

        it('should return 404 for non-existent organization', async () => {
            const nonExistentOrgId = new Types.ObjectId();
            const response = await request(app)
                .post('/api/user/register')
                .send({
                    ...validUserData,
                    organizationId: nonExistentOrgId.toString()
                });

            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('Organization not found');
        });

        it('should return 400 for invalid organization ID format', async () => {
            const response = await request(app)
                .post('/api/user/register')
                .send({
                    ...validUserData,
                    organizationId: 'invalid-id'
                });

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid request body');
        });

        it('should return 400 for duplicate username', async () => {
            // First registration
            await request(app)
                .post('/api/user/register')
                .send(validUserData);

            // Second registration with same username
            const response = await request(app)
                .post('/api/user/register')
                .send({
                    ...validUserData,
                    password: 'differentpassword'
                });

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid registration data');
        });

        it('should return 400 for invalid role', async () => {
            const response = await request(app)
                .post('/api/user/register')
                .send({
                    ...validUserData,
                    role: 'invalidrole' as Role
                });

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid request body');
        });

        it('should accept accountant role', async () => {
            const response = await request(app)
                .post('/api/user/register')
                .send({
                    ...validUserData,
                    role: 'accountant' as Role
                });

            expect(response.status).to.equal(201);
            
            const user = await UserModel.findOne({ username: 'testuser' });
            expect(user?.role).to.equal('accountant');
        });
    });
});
