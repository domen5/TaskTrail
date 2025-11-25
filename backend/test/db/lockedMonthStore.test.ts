import 'mocha';
import { expect } from 'chai';
import { Types } from 'mongoose';
import { setLockedMonth, isMonthLocked } from '../../src/db/lockedMonthStore';
import { LockedMonthModel } from '../../src/models/LockedMonth';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { InputError } from '../../src/utils/errors';
import { UserModel } from '../../src/models/User';

describe('LockedMonthStore Tests', () => {
    const userId = new Types.ObjectId();
    const accountantId = new Types.ObjectId();

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
            role: 'regular'
        });
        await UserModel.create({
            _id: accountantId,
            username: 'Test Accountant',
            password: 'password',
            role: 'accountant'
        });
    });

    describe('setLockedMonth', () => {
        it('should successfully lock a month', async () => {
            const year = 2024;
            const month = 3;

            await setLockedMonth(userId, year, month, accountantId, true);

            const result = await LockedMonthModel.findOne({ userId, year, month });

            expect(result).to.have.property('userId').that.deep.equals(userId);
            expect(result).to.have.property('year', year);
            expect(result).to.have.property('month', month);
            expect(result).to.have.property('lockedBy').that.deep.equals(accountantId);
        });

        it('should not throw error when trying to lock the same month twice', async () => {
            const year = 2024;
            const month = 3;

            await setLockedMonth(userId, year, month, accountantId, true);
            await setLockedMonth(userId, year, month, accountantId, true);

            const result = await LockedMonthModel.findOne({ userId, year, month });
            expect(result).to.not.be.null;
        });

        it('should unlock a locked month', async () => {
            const year = 2024;
            const month = 3;

            await setLockedMonth(userId, year, month, accountantId, true);
            await setLockedMonth(userId, year, month, accountantId, false);

            const result = await LockedMonthModel.findOne({ userId, year, month });
            expect(result).to.be.null;
        });

        it('should throw error for invalid month', async () => {
            try {
                await setLockedMonth(userId, 2024, 13, accountantId, true);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('Month must be between 1 and 12');
            }
        });

        it('should throw error for invalid year', async () => {
            try {
                await setLockedMonth(userId, 800, 3, accountantId, true);
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
                await setLockedMonth(userId, futureYear, 1, accountantId, true);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
                expect(err.message).to.equal('Cannot lock or unlock future months');
            }
        });

        it('should allow locking a month already locked by another user', async () => {
            const year = 2024;
            const month = 3;
            const anotherUserId = new Types.ObjectId();

            await setLockedMonth(userId, year, month, accountantId, true);
            await setLockedMonth(anotherUserId, year, month, accountantId, true);

            const result = await LockedMonthModel.findOne({ userId: anotherUserId, year, month });
            expect(result).to.not.be.null;
            expect(result).to.have.property('userId').that.deep.equals(anotherUserId);
        });

        it('should update lockedBy when locking a month with a different lockedBy ID', async () => {
            const year = 2024;
            const month = 3;
            const anotherAccountantId = new Types.ObjectId();

            await setLockedMonth(userId, year, month, accountantId, true);
            await setLockedMonth(userId, year, month, anotherAccountantId, true);

            const result = await LockedMonthModel.findOne({ userId, year, month });
            expect(result).to.have.property('lockedBy').that.deep.equals(anotherAccountantId);
        });

        it('should successfully lock December and January', async () => {
            const decemberYear = 2024;
            const januaryYear = 2025;

            await setLockedMonth(userId, decemberYear, 12, accountantId, true);
            await setLockedMonth(userId, januaryYear, 1, accountantId, true);

            const decemberResult = await LockedMonthModel.findOne({ userId, year: decemberYear, month: 12 });
            const januaryResult = await LockedMonthModel.findOne({ userId, year: januaryYear, month: 1 });

            expect(decemberResult).to.not.be.null;
            expect(januaryResult).to.not.be.null;
        });
    });

    describe('isMonthLocked', () => {
        it('should return true for locked month', async () => {
            const year = 2024;
            const month = 3;

            await setLockedMonth(userId, year, month, accountantId, true);

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

            await setLockedMonth(userId, year, month, accountantId, true);

            const result = await isMonthLocked(differentUserId, year, month);
            expect(result).to.be.false;
        });
    });
}); 