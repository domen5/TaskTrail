import 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import userRoutes from '../../src/api/userRoutes';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import cookieParser from 'cookie-parser';

describe('User API Tests', () => {
    let app: express.Express;

    before(async () => {
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use(cookieParser());
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
            // expect(cookies).to.include('Secure');
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

    describe('GET /user/verify', () => {
        it('should verify a valid token successfully', async () => {
            console.log('Starting test for valid token verification');
            // First, register and login a user to get a valid token
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            console.log('User registered');

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'validpassword' });

            console.log('User logged in');

            const cookies = loginResponse.headers['set-cookie'][0];

            const response = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', cookies);

            console.log('Verification response received');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Token is valid');
            expect(response.body).to.have.property('user');
        });

        it('should return an error for a missing token', async () => {
            console.log('Starting test for missing token');
            const response = await supertest(app)
                .get('/api/user/verify');

            console.log('Response for missing token received');

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('message', 'Access Denied: No Token Provided!');
        });

        it('should return an error for an invalid token', async () => {
            console.log('Starting test for invalid token');
            const response = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', 'token=invalidtoken');

            console.log('Response for invalid token received');

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Invalid Token');
        });
    });

    describe('POST /user/logout', () => {
        it('should clear the token cookie and return a success message', async () => {
            // First, register and login a user to set a token cookie
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'testuser', password: 'testpassword' });

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'testuser', password: 'testpassword' });

            const cookies = loginResponse.headers['set-cookie'][0];

            // Now, logout the user
            const response = await supertest(app)
                .post('/api/user/logout')
                .set('Cookie', cookies);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Logout successful');
            expect(response.headers['set-cookie'][0]).to.include('token=;');
        });

        it('should return a success message even if no token is present', async () => {
            const response = await supertest(app)
                .post('/api/user/logout');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Logout successful');
        });
    });

});
