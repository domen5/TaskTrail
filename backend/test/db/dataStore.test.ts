import { expect } from 'chai';
import { createWorkedHours } from '../../src/db/dataStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { WorkedHoursModel } from '../../src/models/WorkedHours';
import { InputError } from '../../src/utils/errors';

describe('DataStore Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('createWorkedHours', () => {
        it('should create a new worked hours entry', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            const result = await createWorkedHours(2024, 3, 20, formData);

            expect(result).to.have.property('_id');
            expect(result).to.have.property('date', '2024-03-20');
            expect(result).to.have.property('project', 'Test Project');
            expect(result).to.have.property('hours', 8);
            expect(result).to.have.property('description', 'Test description');
            expect(result).to.have.property('overtime', false);

            // Verify the data was saved to the database
            const savedData = await WorkedHoursModel.findById(result._id);
            expect(savedData).to.not.be.null;
            expect(savedData?.project).to.equal('Test Project');
        });

        it('should throw InputError for invalid date format', async () => {
            const formData = {
                date: '2024-13-40', // invalid date
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 13, 40, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.include('Invalid date format');
            }
        });

        it('should throw ValidationError for invalid data types', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 'invalid' as any, // invalid hours type
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.have.property('name', 'ValidationError');
            }
        });

        it('should handle multiple entries for the same date', async () => {
            const formData1 = {
                date: '2024-03-20',
                project: 'Project 1',
                hours: 4,
                description: 'Morning work',
                overtime: false
            };

            const formData2 = {
                date: '2024-03-20',
                project: 'Project 2',
                hours: 4,
                description: 'Afternoon work',
                overtime: false
            };

            const result1 = await createWorkedHours(2024, 3, 20, formData1);
            const result2 = await createWorkedHours(2024, 3, 20, formData2);

            expect(result1._id).to.not.equal(result2._id);
            
            // Verify both entries exist in the database
            const entries = await WorkedHoursModel.find({ date: '2024-03-20' });
            expect(entries).to.have.lengthOf(2);
            expect(entries.map(e => e.project)).to.include.members(['Project 1', 'Project 2']);
        });
    });
}); 