import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { OrganizationModel } from '../../src/models/Organization';
import { Types } from 'mongoose';
import organizationRoutes from '../../src/api/organizationRoutes';

describe('Organization API Routes', () => {
    let app: express.Express;

    before(async () => {
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use('/api/organization', organizationRoutes);
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/organization', () => {
        it('should create a new organization successfully', async () => {
            const orgData = { name: 'Test Organization' };
            
            const response = await request(app)
                .post('/api/organization')
                .send(orgData);

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('name', orgData.name);
            expect(response.body).to.have.property('_id');

            const org = await OrganizationModel.findById(response.body._id);
            expect(org).to.exist;
            expect(org?.name).to.equal(orgData.name);
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/organization')
                .send({});

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Name is required');
        });
    });

    describe('GET /api/organization', () => {
        it('should retrieve an organization by id', async () => {
            const org = await OrganizationModel.create({ name: 'Test Organization' });
            
            const response = await request(app)
                .get('/api/organization')
                .query({ id: org._id.toString() });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('name', org.name);
            expect(response.body._id).to.equal(org._id.toString());
        });

        it('should retrieve an organization by name', async () => {
            const org = await OrganizationModel.create({ name: 'Test Organization' });
            
            const response = await request(app)
                .get('/api/organization')
                .query({ name: org.name });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('name', org.name);
            expect(response.body._id).to.equal(org._id.toString());
        });

        it('should return 400 when no query parameters are provided', async () => {
            const response = await request(app)
                .get('/api/organization');

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Provide either id or name');
        });

        it('should return 404 when organization is not found by id', async () => {
            const nonExistentId = new Types.ObjectId();
            
            const response = await request(app)
                .get('/api/organization')
                .query({ id: nonExistentId.toString() });

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('message', 'Organization not found');
        });

        it('should return 404 when organization is not found by name', async () => {
            const response = await request(app)
                .get('/api/organization')
                .query({ name: 'Non Existent Organization' });

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('message', 'Organization not found');
        });

        it('should return 500 for invalid organization id format', async () => {
            const response = await request(app)
                .get('/api/organization')
                .query({ id: 'invalid-id' });

            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('message', 'Something went wrong');
        });
    });
});
