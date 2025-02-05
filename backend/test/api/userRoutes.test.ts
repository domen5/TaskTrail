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
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'validpassword' });

            const cookies = loginResponse.headers['set-cookie'][0];

            const response = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', cookies);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Token is valid');
            expect(response.body).to.have.property('user');
        });

        it('should return an error for a missing token', async () => {
            const response = await supertest(app)
                .get('/api/user/verify');

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('message', 'Access Denied: No Token Provided!');
        });

        it('should return an error for an invalid token', async () => {
            const response = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', 'token=invalidtoken');

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Invalid Token');
        });
    });

    describe('POST /user/logout', () => {
        it('should clear the token cookie, blacklist the token and return a success message', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'testuser', password: 'testpassword' });

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'testuser', password: 'testpassword' });

            const cookies = loginResponse.headers['set-cookie'][0];

            const response = await supertest(app)
                .post('/api/user/logout')
                .set('Cookie', cookies);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Logout successful');
            expect(response.headers['set-cookie'][0]).to.include('token=;');

            const verifyResponse = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', cookies);

            expect(verifyResponse.status).to.equal(401);
            expect(verifyResponse.body).to.have.property('message', 'Access Denied: Token is blacklisted!');
        });

        it('should return a success message even if no token is present', async () => {
            const response = await supertest(app)
                .post('/api/user/logout');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Logout successful');
        });
    });

    describe('POST /user/refresh-token', () => {
        it('should refresh the token successfully and blacklist the old token', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'validpassword' });

            const oldCookie = loginResponse.headers['set-cookie'][0];

            const refreshResponse = await supertest(app)
                .post('/api/user/refresh-token')
                .set('Cookie', oldCookie);

            expect(refreshResponse.status).to.equal(200);
            expect(refreshResponse.body).to.have.property('message', 'Token refreshed successfully');
            expect(refreshResponse.headers['set-cookie'][0]).to.include('token=');

            // Verify that the old token is blacklisted
            const verifyOldTokenResponse = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', oldCookie);

            expect(verifyOldTokenResponse.status).to.equal(401);
            expect(verifyOldTokenResponse.body).to.have.property('message', 'Access Denied: Token is blacklisted!');

            // Verify that the new token works
            const newCookies = refreshResponse.headers['set-cookie'][0];
            const verifyNewTokenResponse = await supertest(app)
                .get('/api/user/verify')
                .set('Cookie', newCookies);

            expect(verifyNewTokenResponse.status).to.equal(200);
            expect(verifyNewTokenResponse.body).to.have.property('message', 'Token is valid');
        });

        it('should return an error for a missing token', async () => {
            const response = await supertest(app)
                .post('/api/user/refresh-token');

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('message', 'Access Denied: No Token Provided!');
        });

        it('should return an error for an invalid token', async () => {
            const response = await supertest(app)
                .post('/api/user/refresh-token')
                .set('Cookie', 'token=invalidtoken');

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Invalid Token');
        });

        it('should not allow reuse of a blacklisted token', async () => {
            await supertest(app)
                .post('/api/user/register')
                .send({ username: 'validuser', password: 'validpassword' });

            const loginResponse = await supertest(app)
                .post('/api/user/login')
                .send({ username: 'validuser', password: 'validpassword' });

            const cookies = loginResponse.headers['set-cookie'][0];

            // First refresh should succeed
            await supertest(app)
                .post('/api/user/refresh-token')
                .set('Cookie', cookies);

            // Second refresh with same token should fail
            const secondRefreshResponse = await supertest(app)
                .post('/api/user/refresh-token')
                .set('Cookie', cookies);

            expect(secondRefreshResponse.status).to.equal(401);
            expect(secondRefreshResponse.body).to.have.property('message', 'Access Denied: Token is blacklisted!');
        });
    });

});
