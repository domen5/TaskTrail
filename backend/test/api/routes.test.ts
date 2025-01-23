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
        await clearDatabase();  // Clear database before each test
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
}); 