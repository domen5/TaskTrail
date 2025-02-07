import 'mocha';
import { expect } from 'chai';
import { createWorkedHours, updateWorkedHours, deleteWorkedHours, getWorkedHours, getMonthWorkedHours } from '../../src/db/dataStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { WorkedHoursModel } from '../../src/models/WorkedHours';
import { InputError } from '../../src/utils/errors';
import { Types } from 'mongoose';

describe('DataStore Tests', () => {
    const testUserId = new Types.ObjectId();

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
            const testDate = new Date(2024, 2, 20); // March 20, 2024
            const formData = {
                user: testUserId,
                date: testDate,
                project: '  Test Project  ',
                hours: 8,
                description: '  Test description  ',
                overtime: false
            };

            const result = await createWorkedHours(2024, 3, 20, formData);

            expect(result).to.have.property('project', 'Test Project');
            expect(result).to.have.property('description', 'Test description');
            expect(result.user.toString()).to.equal(testUserId.toString());
            expect(new Date(result.date).getTime()).to.equal(testDate.getTime());
            expect(result).to.have.property('createdAt');
            expect(result).to.have.property('updatedAt');
            expect(new Date(result.createdAt!).getTime()).to.equal(new Date(result.updatedAt!).getTime());

            const savedData = await WorkedHoursModel.findById(result._id);
            expect(savedData?.project).to.equal('Test Project');
            expect(savedData?.description).to.equal('Test description');
            expect(savedData?.user.toString()).to.equal(testUserId.toString());
            expect(savedData?.date.getTime()).to.equal(testDate.getTime());
            expect(savedData?.createdAt?.getTime()).to.equal(new Date(result.createdAt!).getTime());
            expect(savedData?.updatedAt?.getTime()).to.equal(new Date(result.updatedAt!).getTime());
        });

        it('should handle empty description', async () => {
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
                project: 'Test Project',
                hours: 8,
                description: '',
                overtime: false
            };

            const result = await createWorkedHours(2024, 3, 20, formData);
            expect(result).to.have.property('description', '');
        });

        it('should throw InputError for empty project name', async () => {
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
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
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
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
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
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
            const testDate = new Date(-10, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(-10, 3, 20, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });

        it('should throw InputError for invalid date (non-existent date)', async () => {
            const testDate = new Date(2024, 1, 30); // February 30th doesn't exist
            const formData = {
                user: testUserId,
                date: testDate,
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
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });

        it('should throw InputError for invalid month', async () => {
            const testDate = new Date(2024, 12, 20); // Month 13 (0-based)
            const formData = {
                user: testUserId,
                date: testDate,
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
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });

        it('should throw InputError for invalid day', async () => {
            const testDate = new Date(2024, 3, 31); // April 31st doesn't exist
            const formData = {
                user: testUserId,
                date: testDate,
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };

            try {
                await createWorkedHours(2024, 4, 31, formData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });

        it('should handle multiple entries for the same date', async () => {
            const testDate = new Date(2024, 2, 20);
            const formData1 = {
                user: testUserId,
                date: testDate,
                project: 'Project 1',
                hours: 4,
                description: 'Morning work',
                overtime: false
            };

            const formData2 = {
                user: testUserId,
                date: testDate,
                project: 'Project 2',
                hours: 4,
                description: 'Afternoon work',
                overtime: false
            };

            const result1 = await createWorkedHours(2024, 3, 20, formData1);
            const result2 = await createWorkedHours(2024, 3, 20, formData2);

            expect(result1._id).to.not.equal(result2._id);

            const entries = await WorkedHoursModel.find({ date: testDate });
            expect(entries).to.have.lengthOf(2);
            expect(entries.map(e => e.project)).to.include.members(['Project 1', 'Project 2']);
        });
    });

    describe('getWorkedHours', () => {
        beforeEach(async () => {
            const testDate = new Date(2024, 2, 20);
            const entries = [
                {
                    user: testUserId,
                    date: testDate,
                    project: 'Project 1',
                    hours: 4,
                    description: 'Morning work',
                    overtime: false
                },
                {
                    user: testUserId,
                    date: testDate,
                    project: 'Project 2',
                    hours: 4,
                    description: 'Afternoon work',
                    overtime: true
                }
            ];

            for (const entry of entries) {
                await createWorkedHours(2024, 3, 20, entry);
            }
        });

        it('should return all entries for a specific date', async () => {
            const result = await getWorkedHours(2024, 3, 20, testUserId);
            expect(result).to.be.an('array').with.lengthOf(2);
            expect(result[0]).to.have.property('project', 'Project 1');
            expect(result[1]).to.have.property('project', 'Project 2');
            expect(new Date(result[0].date).getMonth()).to.equal(2); // March (0-based)
            expect(new Date(result[1].date).getMonth()).to.equal(2);
        });

        it('should return empty array for date with no entries', async () => {
            const result = await getWorkedHours(2024, 3, 21, testUserId);
            expect(result).to.be.an('array').that.is.empty;
        });

        it('should throw InputError for invalid date', async () => {
            try {
                await getWorkedHours(2024, 13, 45, testUserId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });
    });

    describe('updateWorkedHours', () => {
        let existingEntryId: string;

        beforeEach(async () => {
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
                project: 'Original Project',
                hours: 8,
                description: 'Original description',
                overtime: false
            };
            const result = await createWorkedHours(2024, 3, 20, formData);
            existingEntryId = result._id.toString();
        });

        it('should update an existing worked hours entry', async () => {
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
                project: 'Updated Project',
                hours: 6,
                description: 'Updated description',
                overtime: true
            };

            // Add delay to ensure timestamps are different
            await new Promise(resolve => setTimeout(resolve, 100));

            const result = await updateWorkedHours(existingEntryId, updateData);

            expect(result).to.have.property('project', 'Updated Project');
            expect(result).to.have.property('hours', 6);
            expect(result.user.toString()).to.equal(testUserId.toString());
            expect(result).to.have.property('description', 'Updated description');
            expect(result).to.have.property('overtime', true);
            expect(new Date(result.date).getTime()).to.equal(updatedDate.getTime());
            expect(result).to.have.property('createdAt');
            expect(result).to.have.property('updatedAt');
            expect(new Date(result.updatedAt!).getTime()).to.be.above(new Date(result.createdAt!).getTime());

            const updated = await WorkedHoursModel.findById(existingEntryId);
            expect(updated?.project).to.equal('Updated Project');
            expect(updated?.user.toString()).to.equal(testUserId.toString());
            expect(updated?.date.getTime()).to.equal(updatedDate.getTime());
            expect(updated?.createdAt?.getTime()).to.equal(new Date(result.createdAt!).getTime());
            expect(updated?.updatedAt?.getTime()).to.equal(new Date(result.updatedAt!).getTime());
        });

        it('should trim strings in update data', async () => {
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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

        it('should throw InputError for invalid date', async () => {
            const invalidDate = new Date('invalid');
            const updateData = {
                user: testUserId,
                date: invalidDate,
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
                expect((err as InputError).message).to.equal('Invalid date format.');
            }
        });

        it('should throw InputError for non-existent ID', async () => {
            const nonExistentId = '65f1f8971fa0a647c0a7c001';
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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
                expect((err as InputError).message).to.equal('No record found with the given ID for this user.');
            }
        });

        it('should throw InputError for invalid ID format', async () => {
            const invalidId = 'invalid-id';
            const updatedDate = new Date(2024, 2, 20);
            const updateData = {
                user: testUserId,
                date: updatedDate,
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
            const testDate = new Date(2024, 2, 20);
            const formData = {
                user: testUserId,
                date: testDate,
                project: 'Test Project',
                hours: 8,
                description: 'Test description',
                overtime: false
            };
            const result = await createWorkedHours(2024, 3, 20, formData);
            existingEntryId = result._id.toString();
        });

        it('should delete an existing entry', async () => {
            await deleteWorkedHours(existingEntryId, testUserId);
            const deleted = await WorkedHoursModel.findById(existingEntryId);
            expect(deleted).to.be.null;
        });

        it('should throw InputError for non-existent ID', async () => {
            const nonExistentId = '65f1f8971fa0a647c0a7c001';
            try {
                await deleteWorkedHours(nonExistentId, testUserId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('No record found with the given ID for this user.');
            }
        });

        it('should throw InputError for invalid ID format', async () => {
            try {
                await deleteWorkedHours('invalid-id', testUserId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid ID format.');
            }
        });
    });

    describe('getMonthWorkedHours', () => {
        beforeEach(async () => {
            const entries = [
                {
                    user: testUserId,
                    date: new Date(2024, 2, 1),
                    project: 'Project 1',
                    hours: 4,
                    description: 'Day 1 work',
                    overtime: false
                },
                {
                    user: testUserId,
                    date: new Date(2024, 2, 15),
                    project: 'Project 2',
                    hours: 8,
                    description: 'Day 15 work',
                    overtime: true
                },
                {
                    user: testUserId,
                    date: new Date(2024, 3, 1),
                    project: 'Project 3',
                    hours: 6,
                    description: 'Next month work',
                    overtime: false
                }
            ];

            for (const entry of entries) {
                const year = entry.date.getFullYear();
                const month = entry.date.getMonth() + 1;
                const day = entry.date.getDate();
                await createWorkedHours(year, month, day, entry);
            }
        });

        it('should return all entries for a specific month', async () => {
            const result = await getMonthWorkedHours(2024, 3, testUserId);
            expect(result).to.be.an('array').with.lengthOf(2);
            expect(result.map(r => r.project)).to.include.members(['Project 1', 'Project 2']);
            result.forEach(entry => {
                expect(new Date(entry.date).getMonth()).to.equal(2); // March (0-based)
                expect(entry.user.toString()).to.equal(testUserId.toString());
            });
        });

        it('should return empty array for month with no entries', async () => {
            const result = await getMonthWorkedHours(2024, 5, testUserId);
            expect(result).to.be.an('array').that.is.empty;
        });

        it('should throw InputError for invalid year', async () => {
            try {
                await getMonthWorkedHours(-10, 3, testUserId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });

        it('should throw InputError for invalid month', async () => {
            try {
                await getMonthWorkedHours(2024, 13, testUserId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect((err as InputError).message).to.equal('Invalid date.');
            }
        });
    });
});
