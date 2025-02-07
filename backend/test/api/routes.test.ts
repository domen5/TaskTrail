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

describe('API Tests', () => {
    let app: express.Express;
    let token: string;
    const testUserId = 'testUserId';

    before(async () => {
        await setupTestDB();
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api', routes);
        
        await TokenVersion.create({ userId: testUserId, version: 1 });
        token = await makeToken({ 
            _id: testUserId, 
            username: 'testUser', 
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

            const response = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array');
            expect(response.body[0]).to.have.property('project', 'Test Project');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(response.body[0]).to.have.property('description', 'Test description');
            expect(response.body[0]).to.have.property('overtime', false);
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
            expect(new Date(updateResponse.body.date).getTime()).to.equal(updatedDate.getTime());
            expect(updateResponse.body).to.have.property('createdAt');
            expect(updateResponse.body).to.have.property('updatedAt');
            expect(new Date(updateResponse.body.updatedAt).getTime()).to.be.above(new Date(updateResponse.body.createdAt).getTime());

            const getResponse = await supertest(app)
                .get('/api/worked-hours/2024/3/20')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(getResponse.body[0]).to.have.property('project', 'Updated Project');
            expect(getResponse.body[0]).to.have.property('hours', 6);
            expect(new Date(getResponse.body[0].date).getTime()).to.equal(updatedDate.getTime());
        });

        it('should return 400 for invalid id', async () => {
            const testDate = new Date(2024, 2, 20);
            const invalidData = {
                workedHours: {
                    _id: 'invalid-id',
                    date: testDate.toISOString(),
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const response = await supertest(app)
                .put('/api/worked-hours')
                .set('Cookie', `token=${token}`)
                .send(invalidData)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
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

            const response = await supertest(app)
                .get('/api/worked-hours/2024/3')
                .set('Cookie', `token=${token}`)
                .expect(200);

            expect(response.body).to.be.an('array').with.lengthOf(2);
            expect(response.body[0]).to.have.property('project', 'Test Project 1');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(new Date(response.body[0].date).getTime()).to.equal(testDate1.getTime());
            expect(response.body[1]).to.have.property('project', 'Test Project 2');
            expect(response.body[1]).to.have.property('hours', 6);
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
});
