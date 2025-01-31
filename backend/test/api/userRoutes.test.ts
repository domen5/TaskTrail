import 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import userRoutes from '../../src/api/userRoutes';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';

describe('User API Tests', () => {
    let app: express.Express;

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
    });

    describe('POST /user/register', () => {
        it('should register a new user successfully', async () => {
            const response = await supertest(app)
                .post('/api/user/register')
                .send({ username: 'newuser', password: 'newpassword' });

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('message', 'User registered successfully');
        });

        it('should not allow registration with an existing username', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'existinguser', password: 'password' });

            const response = await supertest(app)
                .post('/api/user/register')
                .send({ username: 'existinguser', password: 'password' });

            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('message', 'Something went wrong');
        });

        it('should return an error for missing username', async () => {
            const response = await supertest(app)
                .post('/api/user/register')
                .send({ password: 'password' });

            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('message', 'Something went wrong');
        });

        it('should return an error for missing password', async () => {
            const response = await supertest(app)
                .post('/api/user/register')
                .send({ username: 'user' });

            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('message', 'Something went wrong');
        });
    });
});
