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
}); 