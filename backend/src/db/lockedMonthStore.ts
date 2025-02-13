import { Types } from "mongoose";
import { LockedMonthModel } from "../models/LockedMonth";
import { InputError } from "../utils/errors";

const setLockedMonth = async (userId: Types.ObjectId, year: number, month: number, lockedBy: Types.ObjectId, locked: boolean) => {
    if (month < 1 || month > 12) {
        throw new InputError('Month must be between 1 and 12');
    }

    if (year < 1900 || year > 9999) {
        throw new InputError('Invalid year');
    }

    if(!userId) {
        throw new InputError('User ID is required');
    }

    if (!lockedBy) {
        throw new InputError('LockedBy ID is required');
    }

    const currentDate = new Date();
    const targetDate = new Date(year, month - 1);

    if (targetDate > currentDate) {
        throw new InputError('Cannot lock or unlock future months');
    }

    const existingLockedMonth = await LockedMonthModel.findOne({
        userId: userId,
        year: year,
        month: month
    });

    if (locked) {
        if (!existingLockedMonth) {
            await LockedMonthModel.create({
                userId: userId,
                year,
                month,
                lockedBy
            });
        }
    } else {
        if (existingLockedMonth) {
            await LockedMonthModel.deleteOne({
                userId: userId,
                year: year,
                month: month
            });
        }
    }
}

const isMonthLocked = async (userId: Types.ObjectId, year: number, month: number): Promise<boolean> => {
    if (month < 1 || month > 12) {
        throw new InputError('Month must be between 1 and 12');
    }

    if (year < 1900 || year > 9999) {
        throw new InputError('Invalid year');
    }

    if(!userId) {
        throw new InputError('User ID is required');
    }

    const lockedMonth = await LockedMonthModel.findOne({
        userId: userId,
        year: year,
        month: month
    });
    return !!lockedMonth;
}; 

export { isMonthLocked, setLockedMonth };
