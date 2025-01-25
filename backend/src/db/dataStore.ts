import mongoose from 'mongoose';
import WorkedHours, { WorkedHoursModel } from "../models/WorkedHours";
import { MONGODB_URI } from "../config";
import { InputError } from '../utils/errors';

export async function initializeDatabase(uri: string = MONGODB_URI) {
    try {
        await mongoose.connect(uri);
        console.log('Connected to database');
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

const createKey = (year: number, month: number, day: number): string => {
    const key = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    if (!isValidKey(key)) {
        throw new InputError('Invalid date format. Date must be in YYYY-MM-DD format.');
    }
    return key;
};

const isValidKey = (key: string): boolean => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(key)) {
        return false;
    }

    const [yearStr, monthStr, dayStr] = key.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    if (year < 1900 || year > 9999) {
        return false;
    }

    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
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

    const date = createKey(year, month, day);

    const model = new WorkedHoursModel({
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

export const getWorkedHours = async (year: number, month: number, day: number): Promise<WorkedHours[]> => {
    try {
        const key = createKey(year, month, day);
        const data = await WorkedHoursModel.find({ date: key });
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
    if (!isValidKey(workedHours.date)) {
        throw new InputError('Invalid date format. Date must be in YYYY-MM-DD format.');
    }

    const sanitizedData = {
        date: workedHours.date,
        project: workedHours.project.trim(),
        hours: workedHours.hours,
        description: workedHours.description?.trim() || '',
        overtime: workedHours.overtime
    };

    try {
        const result = await WorkedHoursModel.findByIdAndUpdate(
            id,
            sanitizedData,
            { new: true, runValidators: true }
        );

        if (!result) {
            throw new InputError('No record found with the given ID.');
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

export const deleteWorkedHours = async (id: string) => {
    try {
        const result = await WorkedHoursModel.findByIdAndDelete(id);
        if (!result) {
            throw new InputError('No record found with the given ID.');
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

export const getMonthWorkedHours = async (year: number, month: number): Promise<WorkedHours[]> => {
    try {
        const key = createKey(year, month, 1);
        const prefix = key.slice(0, 7); // Get YYYY-MM part
        const data = await WorkedHoursModel.find({ date: { $regex: `^${prefix}` } });
        return data || [];
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        console.error('Error retrieving data:', err);
        throw err;
    }
};

// // Mock data for developement and testing
// addWorkedHours(2025, 1, 1, {
//     date: "2025-01-01",
//     project: "project1",
//     hours: 1,
//     description: "Test description for 2025-01-01",
//     overtime: false,
// })
// addWorkedHours(2025, 1, 1, {
//     date: "2025-01-01",
//     project: "project1",
//     hours: 2,
//     description: "Test description for 2025-01-01",
//     overtime: false,
// })
// addWorkedHours(2025, 1, 1, {
//     date: "2025-01-01",
//     project: "project1",
//     hours: 2,
//     description: "Test description for 2025-01-01",
//     overtime: false,
// })
// addWorkedHours(2025, 1, 2, {
//     date: "2025-01-02",
//     project: "project1",
//     hours: 4,
//     description: "Test description for 2025-01-02",
//     overtime: false,
// })
// addWorkedHours(2025, 1, 2, {
//     date: "2025-01-02",
//     project: "project1",
//     hours: 4,
//     description: "Test description for 2025-01-02",
//     overtime: false,
// })
// addWorkedHours(2025, 1, 3, {
//     date: "2025-01-03",
//     project: "project1",
//     hours: 4,
//     description: "Test description for 2025-01-03",
//     overtime: false,
// })
// addWorkedHours(2025, 2, 1, {
//     date: "2025-02-01",
//     project: "project1",
//     hours: 4,
//     description: "Test description for 2025-02-01",
//     overtime: false,
// })
