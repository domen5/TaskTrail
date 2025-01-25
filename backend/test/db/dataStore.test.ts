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
        it('should create a new worked hours entry with trimmed strings', async () => {
            const formData = {
                date: '2024-03-20',
                project: '  Test Project  ',
                hours: 8,
                description: '  Test description  ',
                overtime: false
            };

            const result = await createWorkedHours(2024, 3, 20, formData);

            expect(result).to.have.property('project', 'Test Project');
            expect(result).to.have.property('description', 'Test description');
            
            // Verify trimmed strings in database
            const savedData = await WorkedHoursModel.findById(result._id);
            expect(savedData?.project).to.equal('Test Project');
            expect(savedData?.description).to.equal('Test description');
        });

        it('should handle empty description', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: '',
                overtime: false
            };

            const result = await createWorkedHours(2024, 3, 20, formData);
            expect(result).to.have.property('description', '');
        });

        it('should throw InputError for empty project name', async () => {
            const formData = {
                date: '2024-03-20',
                project: '   ',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Project name is required.');
            }
        });

        it('should throw InputError for non-positive hours', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 0,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Hours must be a positive number.');
            }
        });

        it('should throw InputError for invalid overtime type', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: 'true' as any
            };

            try {
                await createWorkedHours(2024, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Overtime must be a boolean value.');
            }
        });

        it('should throw InputError for invalid year', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(1899, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid year. Must be between 1900 and 9999.');
            }
        });

        it('should throw InputError for invalid month', async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 13, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid month. Must be between 1 and 12.');
            }
        });

        it('should throw InputError for invalid day', async () => {
            const formData = {
                date: '2024-02-30',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 2, 30, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid day. Must be between 1 and 29 for month 2.');
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