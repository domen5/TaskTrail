import { Types } from "mongoose";
import { LockedMonthModel } from "../models/LockedMonth";
import { InputError } from "../utils/errors";

const lockMonth = async (organizationId: Types.ObjectId, year: number, month: number, userId: Types.ObjectId) => {
    if (month < 1 || month > 12) {
        throw new InputError('Month must be between 1 and 12');
    }

    if (year < 1900 || year > 9999) {
        throw new InputError('Invalid year');
    }

    if(!userId) {
        throw new InputError('User ID is required');
    }

    if(!organizationId) {
        throw new InputError('Organization ID is required');
    }

    const currentDate = new Date();
    const targetDate = new Date(year, month - 1);

    if (targetDate > currentDate) {
        throw new InputError('Cannot lock future months');
    }

    try {
        const lockedMonth = await LockedMonthModel.create({
            organization: organizationId,
            year,
            month,
            lockedBy: userId
        });
        return lockedMonth;
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            throw new InputError('This month is already locked');
        }
        throw err;
    }
};

const isMonthLocked = async (organizationId: Types.ObjectId, year: number, month: number): Promise<boolean> => {
    const lockedMonth = await LockedMonthModel.findOne({
        organization: organizationId,
        year,
        month
    });
    return !!lockedMonth;
}; 

export { lockMonth, isMonthLocked };
