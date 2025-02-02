import 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import userRoutes from '../../src/api/userRoutes';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../src/config';

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

    describe('POST /user/login', () => {
        it('should login successfully with valid credentials', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            const response = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'validpassword' });

            expect(response.status).to.equal(200);
            expect(response.headers['set-cookie']).to.exist;
            const cookies = response.headers['set-cookie'][0];
            expect(cookies).to.include('token=');
            expect(cookies).to.include('HttpOnly');
            expect(cookies).to.include('Secure');
            expect(cookies).to.include('SameSite=Strict');
        });

        it('should return an error for an invalid username', async () => {
            const response = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'invaliduser', password: 'validpassword' });

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('message', 'Invalid username or password');
        });

        it('should return an error for an invalid password', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            const response = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'invalidpassword' });

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('message', 'Invalid username or password');
        });

        it('should return an error for missing username', async () => {
            const response = await supertest(app)
                .post('/api/user/login')
                .send({ password: 'validpassword' });

            expect(response.status).to.equal(422);
            expect(response.body).to.have.property('message', 'Username and password are required');
        });

        it('should return an error for missing password', async () => {
            const response = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser' });

            expect(response.status).to.equal(422);
            expect(response.body).to.have.property('message', 'Username and password are required');
        });
    });
});
