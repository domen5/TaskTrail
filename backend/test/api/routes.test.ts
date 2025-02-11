import 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from '../../src/api/routes';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { makeToken } from '../../src/utils/auth';
import { JWT_SECRET } from '../../src/config';
import { TokenVersion } from '../../src/db/tokenStore';
import { Types } from 'mongoose';
import { UserModel } from '../../src/models/User';
import { LockedMonthModel } from '../../src/models/LockedMonth';
import { OrganizationModel } from '../../src/models/Organization';

describe('API Tests', () => {
    let app: express.Express;
    let token: string;
    let token2: string;
    const testUserId = new Types.ObjectId().toString();
    const testUserId2 = new Types.ObjectId().toString();
    const testOrgId = new Types.ObjectId();
    
    before(async function() {
        this.timeout(10000); // Set timeout to 10 seconds
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api', routes);

        await TokenVersion.create({ userId: testUserId, version: 1 });
        await TokenVersion.create({ userId: testUserId2, version: 1 });

        token = await makeToken({ 
            _id: testUserId, 
            username: 'testUser', 
            exp: 1000 * 60 * 60, 
            version: 1 
        }, JWT_SECRET);

        token2 = await makeToken({ 
            _id: testUserId2, 
            username: 'testUser2', 
            exp: 1000 * 60 * 60, 
            version: 1 
        }, JWT_SECRET);
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        await TokenVersion.create({ userId: testUserId, version: 1 });
        await TokenVersion.create({ userId: testUserId2, version: 1 });

        await OrganizationModel.create({
            _id: testOrgId,
            name: 'Test Organization'
        });
        
        await UserModel.create({
            _id: testUserId,
            username: 'testUser',
            organization: testOrgId,
            role: 'regular',
            password: 'hashedPassword'
        });
    });

    describe('POST /worked-hours/:year/:month/:day', () => {
        it('should create new worked hours entry', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const response = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            expect(response.body).to.have.property('_id');
            expect(response.body.project).to.equal(workedHours.workedHours.project);
            expect(response.body.hours).to.equal(workedHours.workedHours.hours);
            expect(response.body.description).to.equal(workedHours.workedHours.description);
            expect(response.body.overtime).to.equal(workedHours.workedHours.overtime);
            expect(response.body.user.toString()).to.equal(testUserId);
            expect(response.body).to.have.property('date');
            expect(new Date(response.body.date).getTime()).to.equal(testDate.getTime());
            expect(response.body).to.have.property('createdAt');
            expect(response.body).to.have.property('updatedAt');
            expect(new Date(response.body.createdAt).getTime()).to.equal(new Date(response.body.updatedAt).getTime());
        });

        it('should return 400 for invalid input', async () => {
            const invalidData = {
                workedHours: {
                    date: 'invalid-date',
                    project: 'Test Project',
                    hours: 'invalid-hours',
                    description: 'Test description',
                    overtime: 'invalid-boolean'
                }
            };

            const response = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(invalidData)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('GET /worked-hours/:year/:month/:day', () => {
        it('should return worked hours for a specific date', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            // Create another entry for a different user
            await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token2}`)
                .send(workedHours)
                .expect(201);

            const response = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array').with.lengthOf(1);
            expect(response.body[0]).to.have.property('project', 'Test Project');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(response.body[0]).to.have.property('description', 'Test description');
            expect(response.body[0]).to.have.property('overtime', false);
            expect(response.body[0].user.toString()).to.equal(testUserId);
            expect(new Date(response.body[0].date).getTime()).to.equal(testDate.getTime());
        });

        it('should return 400 for invalid date parameters', async () => {
            await supertest(app)
                .get('/api/worked-hours/invalid/month/day')
                .set('Cookie', `token=${token}`)
                .expect(400);
        });

        it('should return empty array when no entries exist', async () => {
            const response = await supertest(app)
                .get('/api/worked-hours/2024/3/21')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array').that.is.empty;
        });
    });

    describe('DELETE /worked-hours', () => {
        it('should delete worked hours entry', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            await supertest(app)
                .delete('/api/worked-hours')
                .set('Cookie', `token=${token}`)
                .send({ id: createResponse.body._id })
                .expect(200);

            const getResponse = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(getResponse.body).to.be.an('array').that.is.empty;
        });

        it('should not allow deleting another user\'s entry', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            await supertest(app)
                .delete('/api/worked-hours')
                .set('Cookie', `token=${token2}`)
                .send({ id: createResponse.body._id })
                .expect(400);

            // Verify the entry still exists
            const getResponse = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(getResponse.body).to.be.an('array').with.lengthOf(1);
        });

        it('should return 400 for invalid id', async () => {
            const response = await supertest(app)
                .delete('/api/worked-hours')
                .set('Cookie', `token=${token}`)
                .send({ id: 'invalid-id' })
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('PUT /worked-hours', () => {
        it('should update worked hours entry', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            const updatedDate = new Date(2024, 2, 20);
            const updatedData = {
                workedHours: {
                    _id: createResponse.body._id,
                    date: updatedDate.toISOString(),
                    project: 'Updated Project',
                    hours: 6,
                    description: 'Updated description',
                    overtime: true
                }
            };

            const updateResponse = await supertest(app)
                .put('/api/worked-hours')
                .set('Cookie', `token=${token}`)
                .send(updatedData)
                .expect(200);

            expect(updateResponse.body).to.have.property('project', 'Updated Project');
            expect(updateResponse.body).to.have.property('hours', 6);
            expect(updateResponse.body).to.have.property('description', 'Updated description');
            expect(updateResponse.body).to.have.property('overtime', true);
            expect(updateResponse.body.user.toString()).to.equal(testUserId);
            expect(new Date(updateResponse.body.date).getTime()).to.equal(updatedDate.getTime());
        });

        it('should not allow updating another user\'s entry', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            const updatedData = {
                workedHours: {
                    _id: createResponse.body._id,
                    date: testDate.toISOString(),
                    project: 'Updated Project',
                    hours: 6,
                    description: 'Updated description',
                    overtime: true
                }
            };

            await supertest(app)
                .put('/api/worked-hours')
                .set('Cookie', `token=${token2}`)
                .send(updatedData)
                .expect(400);

            // Verify the entry wasn't updated
            const getResponse = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(getResponse.body[0]).to.have.property('project', 'Test Project');
        });

        it('should return 400 for invalid input data', async () => {
            const testDate = new Date(2024, 2, 20);
            const workedHours = {
                workedHours: {
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours)
                .expect(201);

            const invalidUpdate = {
                workedHours: {
                    _id: createResponse.body._id,
                    date: 'invalid-date',
                    project: 'Test Project',
                    hours: 'invalid-hours',
                    description: 'Test description',
                    overtime: 'invalid-boolean'
                }
            };

            const response = await supertest(app)
                .put('/api/worked-hours')
                .set('Cookie', `token=${token}`)
                .send(invalidUpdate)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('GET /worked-hours/:year/:month', () => {
        it('should return all worked hours for a specific month', async () => {
            const testDate1 = new Date(2024, 2, 20);
            const testDate2 = new Date(2024, 2, 21);

            const workedHours1 = {
                workedHours: {
                    date: testDate1.toISOString(),
                    project: 'Test Project 1',
                    hours: 8,
                    description: 'Test description 1',
                    overtime: false
                }
            };

            const workedHours2 = {
                workedHours: {
                    date: testDate2.toISOString(),
                    project: 'Test Project 2',
                    hours: 6,
                    description: 'Test description 2',
                    overtime: true
                }
            };

            await supertest(app)
                .post('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .send(workedHours1)
                .expect(201);

            await supertest(app)
                .post('/api/worked-hours/2024/3/21')
                .set('Cookie', `token=${token}`)
                .send(workedHours2)
                .expect(201);

            // Create an entry for another user
            await supertest(app)
                .post('/api/worked-hours/2024/3/21')
                .set('Cookie', `token=${token2}`)
                .send(workedHours2)
                .expect(201);

            const response = await supertest(app)
                .get('/api/worked-hours/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array').with.lengthOf(2);
            expect(response.body[0]).to.have.property('project', 'Test Project 1');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(response.body[0].user.toString()).to.equal(testUserId);
            expect(new Date(response.body[0].date).getTime()).to.equal(testDate1.getTime());
            expect(response.body[1]).to.have.property('project', 'Test Project 2');
            expect(response.body[1]).to.have.property('hours', 6);
            expect(response.body[1].user.toString()).to.equal(testUserId);
            expect(new Date(response.body[1].date).getTime()).to.equal(testDate2.getTime());
        });

        it('should return 400 for invalid month parameters', async () => {
            await supertest(app)
                .get('/api/worked-hours/2024/invalid')
                .set('Cookie', `token=${token}`)
                .expect(400);
        });

        it('should return empty array when no entries exist for month', async () => {
            const response = await supertest(app)
                .get('/api/worked-hours/2024/4')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array').that.is.empty;
        });
    });

    describe('POST /lock/:year/:month', () => {
        it('should successfully lock a month', async function() {
            this.timeout(10000); // Set timeout to 10 seconds
            const response = await supertest(app)
                .post('/api/lock/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.have.property('message', 'Month locked successfully');

            const lock = await LockedMonthModel.findOne({
                organization: testOrgId,
                year: 2024,
                month: 3
            });

            expect(lock).to.exist;
            expect(lock?.lockedBy.toString()).to.equal(testUserId);
        });

        it('should return 400 for invalid year/month', async function() {
            this.timeout(10000); // Set timeout to 10 seconds
            const response = await supertest(app)
                .post('/api/lock/2024/13')
                .set('Cookie', `token=${token}`)
                .expect(400);

            expect(response.body).to.have.property('message', 'Month must be between 1 and 12');
        });

        it('should return 404 for non-existent user', async () => {
            // Delete the user after creating the token
            await UserModel.deleteOne({ _id: testUserId });

            const response = await supertest(app)
                .post('/api/lock/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(404);

            expect(response.body).to.have.property('message', 'User not found');
        });

        it('should return 401 when no token is provided', async () => {
            const response = await supertest(app)
                .post('/api/lock/2024/3')
                .expect(401);

            expect(response.body).to.have.property('message', 'Access Denied: No Token Provided!');
        });

        it('should return 400 when trying to lock the same month twice', async function() {
            this.timeout(10000); // Set timeout to 10 seconds
            // First lock
            await supertest(app)
                .post('/api/lock/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(200);

            // Try to lock again
            const response = await supertest(app)
                .post('/api/lock/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(400);

            expect(response.body).to.have.property('message', 'This month is already locked');
        });

        it('should return 400 when trying to lock a future month', async function() {
            this.timeout(10000); // Set timeout to 10 seconds
            const currentDate = new Date();
            const futureYear = currentDate.getFullYear() + 1;

            const response = await supertest(app)
                .post(`/api/lock/${futureYear}/1`)
                .set('Cookie', `token=${token}`)
                .expect(400);

            expect(response.body).to.have.property('message', 'Cannot lock future months');
        });
    });
});
