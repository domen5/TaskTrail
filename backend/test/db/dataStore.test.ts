import { expect } from 'chai';
import { createWorkedHours, updateWorkedHours, deleteWorkedHours } from '../../src/db/dataStore';
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

            const entries = await WorkedHoursModel.find({ date: '2024-03-20' });
            expect(entries).to.have.lengthOf(2);
            expect(entries.map(e => e.project)).to.include.members(['Project 1', 'Project 2']);
        });
    });

    describe('updateWorkedHours', () => {
        let existingEntryId: string;

        beforeEach(async () => {
            // Create a test entry before each test
            const formData = {
                date: '2024-03-20',
                project: 'Original Project',
                hours: 8,
                description: 'Original description',
                overtime: false
            };
            const result = await createWorkedHours(2024, 3, 20, formData);
            existingEntryId = result._id.toString();
        });

        it('should update an existing worked hours entry', async () => {
            const updateData = {
                date: '2024-03-20',
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: true
            };

            const result = await updateWorkedHours(existingEntryId, updateData);

            expect(result).to.have.property('project', 'Updated Project');
            expect(result).to.have.property('hours', 6);
            expect(result).to.have.property('description', 'Updated description');
            expect(result).to.have.property('overtime', true);

            const updated = await WorkedHoursModel.findById(existingEntryId);
            expect(updated?.project).to.equal('Updated Project');
        });

        it('should trim strings in update data', async () => {
            const updateData = {
                date: '2024-03-20',
                project: '  Updated Project  ',
                hours: 6,
                description: '  Updated description  ',
                overtime: false
            };

            const result = await updateWorkedHours(existingEntryId, updateData);

            expect(result).to.have.property('project', 'Updated Project');
            expect(result).to.have.property('description', 'Updated description');
        });

        it('should throw InputError for empty project name', async () => {
            const updateData = {
                date: '2024-03-20',
                project: '   ',
                hours: 6,
                description: 'Updated description',
                overtime: false
            };

            try {
                await updateWorkedHours(existingEntryId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Project name is required.');
            }
        });

        it('should throw InputError for non-positive hours', async () => {
            const updateData = {
                date: '2024-03-20',
                project: 'Updated Project',
                hours: 0,
                description: 'Updated description',
                overtime: false
            };

            try {
                await updateWorkedHours(existingEntryId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Hours must be a positive number.');
            }
        });

        it('should throw InputError for invalid overtime type', async () => {
            const updateData = {
                date: '2024-03-20',
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: 'true' as any
            };

            try {
                await updateWorkedHours(existingEntryId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Overtime must be a boolean value.');
            }
        });

        it('should throw InputError for invalid date format', async () => {
            const updateData = {
                date: '2024-13-45',
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: false
            };

            try {
                await updateWorkedHours(existingEntryId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date format. Date must be in YYYY-MM-DD format.');
            }
        });

        it('should throw InputError for non-existent ID', async () => {
            const nonExistentId = '65f1f8971fa0a647c0a7c001'; // Valid MongoDB ID that doesn't exist
            const updateData = {
                date: '2024-03-20',
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: false
            };

            try {
                await updateWorkedHours(nonExistentId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('No record found with the given ID.');
            }
        });

        it('should throw InputError for invalid ID format', async () => {
            const invalidId = 'invalid-id';
            const updateData = {
                date: '2024-03-20',
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: false
            };

            try {
                await updateWorkedHours(invalidId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid ID format.');
            }
        });
    });

    describe('deleteWorkedHours', () => {
        let existingEntryId: string;

        beforeEach(async () => {
            const formData = {
                date: '2024-03-20',
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };
            const result = await createWorkedHours(2024, 3, 20, formData);
            existingEntryId = result._id.toString();
        });

        it('should delete an existing entry', async () => {
            await deleteWorkedHours(existingEntryId);
            const deleted = await WorkedHoursModel.findById(existingEntryId);
            expect(deleted).to.be.null;
        });

        it('should throw InputError for non-existent ID', async () => {
            const nonExistentId = '65f1f8971fa0a647c0a7c001';
            try {
                await deleteWorkedHours(nonExistentId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('No record found with the given ID.');
            }
        });

        it('should throw InputError for invalid ID format', async () => {
            try {
                await deleteWorkedHours('invalid-id');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid ID format.');
            }
        });
    });
});