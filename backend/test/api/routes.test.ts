import { expect } from 'chai';
import * as supertest from 'supertest';
import * as express from 'express';
import routes from '../../src/api/routes';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';

describe('API Tests', () => {
    let app: express.Express;

    before(async () => {
        await setupTestDB();
        app = express.default();
        app.use(express.default.json());
        app.use('/api', routes);
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /worked-hours/:year/:month/:day', () => {
        it('should create new worked hours entry', async () => {
            const workedHours = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const response = await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours)
                .expect(201);

            expect(response.body).to.have.property('_id');
            expect(response.body.project).to.equal(workedHours.workedHours.project);
            expect(response.body.hours).to.equal(workedHours.workedHours.hours);
            expect(response.body.description).to.equal(workedHours.workedHours.description);
            expect(response.body.overtime).to.equal(workedHours.workedHours.overtime);
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

            const response = await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(invalidData)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('GET /worked-hours/:year/:month/:day', () => {
        it('should return worked hours for a specific date', async () => {
            // First create test data
            const workedHours = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours)
                .expect(201);

            // Then test GET endpoint
            const response = await supertest.default(app)
                .get('/api/worked-hours/2024/3/20')
                .expect(200);

            expect(response.body).to.be.an('array');
            expect(response.body[0]).to.have.property('project', 'Test Project');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(response.body[0]).to.have.property('description', 'Test description');
            expect(response.body[0]).to.have.property('overtime', false);
        });

        it('should return 400 for invalid date parameters', async () => {
            await supertest.default(app)
                .get('/api/worked-hours/invalid/month/day')
                .expect(400);
        });

        it('should return empty array when no entries exist', async () => {
            const response = await supertest.default(app)
                .get('/api/worked-hours/2024/3/21')
                .expect(200);

            expect(response.body).to.be.an('array').that.is.empty;
        });
    });

    describe('DELETE /worked-hours', () => {
        it('should delete worked hours entry', async () => {
            // First create test data
            const workedHours = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours)
                .expect(201);

            // Then test DELETE endpoint
            await supertest.default(app)
                .delete('/api/worked-hours')
                .send({ id: createResponse.body._id })
                .expect(200);

            // Verify the entry was deleted
            const getResponse = await supertest.default(app)
                .get('/api/worked-hours/2024/3/20')
                .expect(200);

            expect(getResponse.body).to.be.an('array').that.is.empty;
        });

        it('should return 400 for invalid id', async () => {
            const response = await supertest.default(app)
                .delete('/api/worked-hours')
                .send({ id: 'invalid-id' })
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('PUT /worked-hours', () => {
        it('should update worked hours entry', async () => {
            // First create test data
            const workedHours = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours)
                .expect(201);

            // Then test UPDATE endpoint
            const updatedData = {
                workedHours: {
                    _id: createResponse.body._id,
                    date: '2024-03-20',
                    project: 'Updated Project',
                    hours: 6,
                    description: 'Updated description',
                    overtime: true
                }
            };

            const updateResponse = await supertest.default(app)
                .put('/api/worked-hours')
                .send(updatedData)
                .expect(200);

            expect(updateResponse.body).to.have.property('project', 'Updated Project');
            expect(updateResponse.body).to.have.property('hours', 6);
            expect(updateResponse.body).to.have.property('description', 'Updated description');
            expect(updateResponse.body).to.have.property('overtime', true);

            // Verify the update persisted
            const getResponse = await supertest.default(app)
                .get('/api/worked-hours/2024/3/20')
                .expect(200);

            expect(getResponse.body[0]).to.have.property('project', 'Updated Project');
            expect(getResponse.body[0]).to.have.property('hours', 6);
        });

        it('should return 400 for invalid id', async () => {
            const invalidData = {
                workedHours: {
                    _id: 'invalid-id',
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const response = await supertest.default(app)
                .put('/api/worked-hours')
                .send(invalidData)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });

        it('should return 400 for invalid input data', async () => {
            // First create valid entry
            const workedHours = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project',
                    hours: 8,
                    description: 'Test description',
                    overtime: false
                }
            };

            const createResponse = await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours)
                .expect(201);

            // Then try to update with invalid data
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

            const response = await supertest.default(app)
                .put('/api/worked-hours')
                .send(invalidUpdate)
                .expect(400);

            expect(response.body).to.have.property('message', 'Bad input');
        });
    });

    describe('GET /worked-hours/:year/:month', () => {
        it('should return all worked hours for a specific month', async () => {
            // First create test data for multiple days
            const workedHours1 = {
                workedHours: {
                    date: '2024-03-20',
                    project: 'Test Project 1',
                    hours: 8,
                    description: 'Test description 1',
                    overtime: false
                }
            };

            const workedHours2 = {
                workedHours: {
                    date: '2024-03-21',
                    project: 'Test Project 2',
                    hours: 6,
                    description: 'Test description 2',
                    overtime: true
                }
            };

            await supertest.default(app)
                .post('/api/worked-hours/2024/3/20')
                .send(workedHours1)
                .expect(201);

            await supertest.default(app)
                .post('/api/worked-hours/2024/3/21')
                .send(workedHours2)
                .expect(201);

            // Then test GET month endpoint
            const response = await supertest.default(app)
                .get('/api/worked-hours/2024/3')
                .expect(200);

            expect(response.body).to.be.an('array').with.lengthOf(2);
            expect(response.body[0]).to.have.property('project', 'Test Project 1');
            expect(response.body[0]).to.have.property('hours', 8);
            expect(response.body[1]).to.have.property('project', 'Test Project 2');
            expect(response.body[1]).to.have.property('hours', 6);
        });

        it('should return 400 for invalid month parameters', async () => {
            await supertest.default(app)
                .get('/api/worked-hours/2024/invalid')
                .expect(400);
        });

        it('should return empty array when no entries exist for month', async () => {
            const response = await supertest.default(app)
                .get('/api/worked-hours/2024/4')
                .expect(200);

            expect(response.body).to.be.an('array').that.is.empty;
        });
    });
}); 