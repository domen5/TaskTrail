import mongoose from 'mongoose';
import WorkedHours, { WorkedHoursModel } from "../models/WorkedHours";
import { MONGODB_URI } from "../config";
import { InputError } from '../utils/errors';
import { Types } from 'mongoose';

export async function initializeDatabase(uri: string = MONGODB_URI) {
    try {
        await mongoose.connect(uri);
        console.log('Connected to database');
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

const createDate = (year: number, month: number, day: number): Date => {
    const date = new Date(year, month - 1, day);
    if (!isValidDate(date, year, month, day)) {
        throw new InputError('Invalid date.');
    }
    return date;
};

const isValidDate = (date: Date, year?: number, month?: number, day?: number): boolean => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return false;
    }

    const dateYear = date.getFullYear();
    if (dateYear < 1900 || dateYear > 9999) {
        return false;
    }

    // If specific YMD were provided, verify the date wasn't normalized
    if (year !== undefined && month !== undefined && day !== undefined) {
        return date.getFullYear() === year &&
            date.getMonth() === month - 1 && // Convert 1-based month to 0-based
            date.getDate() === day;
    }

    return true;
}

export const createWorkedHours = async (year: number, month: number, day: number, formData: WorkedHours) => {
    if (!formData.project?.trim()) {
        throw new InputError('Project name is required.');
    }
    if (typeof formData.hours !== 'number' || formData.hours <= 0) {
        throw new InputError('Hours must be a positive number.');
    }
    if (typeof formData.overtime !== 'boolean') {
        throw new InputError('Overtime must be a boolean value.');
    }
    if (!formData.user) {
        throw new InputError('User ID is required.');
    }

    const date = createDate(year, month, day);

    const model = new WorkedHoursModel({
        user: formData.user,
        date: date,
        project: formData.project.trim(),
        hours: formData.hours,
        description: formData.description?.trim() || '',
        overtime: formData.overtime,
    });

    try {
        await model.save();
    } catch (err) {
        console.error('Error saving data:', err);
        throw err;
    }
    return model.toJSON();
};

export const getWorkedHours = async (year: number, month: number, day: number, userId: Types.ObjectId): Promise<WorkedHours[]> => {
    try {
        const startDate = createDate(year, month, day);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const data = await WorkedHoursModel.find({
            user: userId,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });
        return data || [];
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        console.error('Error retrieving data:', err);
        throw err;
    }
};

export const updateWorkedHours = async (id: string, workedHours: WorkedHours) => {
    if (!workedHours.project?.trim()) {
        throw new InputError('Project name is required.');
    }
    if (typeof workedHours.hours !== 'number' || workedHours.hours <= 0) {
        throw new InputError('Hours must be a positive number.');
    }
    if (typeof workedHours.overtime !== 'boolean') {
        throw new InputError('Overtime must be a boolean value.');
    }
    if (!workedHours.date) {
        throw new InputError('Date is required.');
    }
    if (!isValidDate(workedHours.date)) {
        throw new InputError('Invalid date format.');
    }
    if (!workedHours.user) {
        throw new InputError('User ID is required.');
    }

    const sanitizedData = {
        user: workedHours.user,
        date: workedHours.date,
        project: workedHours.project.trim(),
        hours: workedHours.hours,
        description: workedHours.description?.trim() || '',
        overtime: workedHours.overtime
    };

    try {
        const result = await WorkedHoursModel.findOneAndUpdate(
            { _id: id, user: workedHours.user },
            sanitizedData,
            { new: true, runValidators: true }
        );

        if (!result) {
            throw new InputError('No record found with the given ID for this user.');
        }

        return result.toJSON();
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            throw new InputError('Invalid ID format.');
        }
        if (err.name === 'ValidationError') {
            throw new InputError('Invalid data format.');
        }
        console.error('Error updating record:', err);
        throw err;
    }
};

export const deleteWorkedHours = async (id: string, userId: Types.ObjectId) => {
    if (!userId) {
        throw new InputError('User ID is required.');
    }

    try {
        const result = await WorkedHoursModel.findOneAndDelete({ _id: id, user: userId });
        if (!result) {
            throw new InputError('No record found with the given ID for this user.');
        }
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            throw new InputError('Invalid ID format.');
        }
        console.error('Error deleting record:', err);
        throw err;
    }
};

export const getMonthWorkedHours = async (year: number, month: number, userId: Types.ObjectId): Promise<WorkedHours[]> => {
    try {
        const startDate = createDate(year, month, 1);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const data = await WorkedHoursModel.find({
            user: userId,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });
        return data || [];
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        console.error('Error retrieving data:', err);
        throw err;
    }
};
