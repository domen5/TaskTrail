import 'mocha';
import { expect } from 'chai';
import { Types } from 'mongoose';
import { lockMonth, isMonthLocked } from '../../src/db/lockedMonthStore';
import { LockedMonthModel } from '../../src/models/LockedMonth';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { InputError } from '../../src/utils/errors';
import { UserModel } from '../../src/models/User';

describe('LockedMonthStore Tests', () => {
    const userId = new Types.ObjectId();
    const accountantId = new Types.ObjectId();
    const organizationId = new Types.ObjectId();

    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        await UserModel.create({
            _id: userId,
            username: 'Test User',
            password: 'password',
            organization: organizationId,
            role: 'regular'
        });
        await UserModel.create({
            _id: accountantId,
            username: 'Test Accountant',
            password: 'password',
            organization: organizationId,
            role: 'accountant'
        });
    });

    describe('lockMonth', () => {
        it('should successfully lock a month', async () => {
            const year = 2024;
            const month = 3;

            const result = await lockMonth(userId, year, month, accountantId);

            expect(result).to.have.property('userId').that.deep.equals(userId);
            expect(result).to.have.property('year', year);
            expect(result).to.have.property('month', month);
            expect(result).to.have.property('lockedBy').that.deep.equals(accountantId);
            expect(result).to.have.property('createdAt');
            expect(result).to.have.property('updatedAt');
        });

        it('should throw error when trying to lock the same month twice', async () => {
            const year = 2024;
            const month = 3;

            await lockMonth(userId, year, month, accountantId);

            try {
                await lockMonth(userId, year, month, accountantId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('This month is already locked');
            }
        });

        it('should throw error for invalid month', async () => {
            try {
                await lockMonth(userId, 2024, 13, accountantId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('Month must be between 1 and 12');
            }
        });

        it('should throw error for invalid year', async () => {
            try {
                await lockMonth(userId, 800, 3, accountantId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('Invalid year');
            }
        });

        it('should throw error when trying to lock future months', async () => {
            const currentDate = new Date();
            const futureYear = currentDate.getFullYear() + 1;

            try {
                await lockMonth(userId, futureYear, 1, accountantId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('Cannot lock future months');
            }
        });
    });

    describe('isMonthLocked', () => {
        it('should return true for locked month', async () => {
            const year = 2024;
            const month = 3;

            await lockMonth(userId, year, month, accountantId);

            const result = await isMonthLocked(userId, year, month);
            expect(result).to.be.true;
        });

        it('should return false for unlocked month', async () => {
            const result = await isMonthLocked(userId, 2024, 3);
            expect(result).to.be.false;
        });

        it('should return false for different user', async () => {
            const year = 2024;
            const month = 3;
            const differentUserId = new Types.ObjectId();

            await lockMonth(userId, year, month, accountantId);

            const result = await isMonthLocked(differentUserId, year, month);
            expect(result).to.be.false;
        });
    });
}); 