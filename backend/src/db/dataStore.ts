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
    // TODO: Implement input validation
    const key = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return key;
};

const isValidKey = (key: string): boolean => {
    // Regular expression to validate YYYY-MM-DD format
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return regex.test(key);
}

export const createWorkedHours = async (year: number, month: number, day: number, formData: WorkedHours) => {
    const date = createKey(year, month, day);
    if (!isValidKey(date)) {
        console.error('date: ' + date);
        throw new InputError('Invalid date format. Please use yyyy-MM-dd format.');
    }
    const model = new WorkedHoursModel({
        date: date,
        project: formData.project,
        hours: formData.hours,
        description: formData.description,
        overtime: formData.overtime,
    });
    try {
        await model.save();
        console.log('Data saved successfully, id: ' + model.id);
    } catch (err) {
        console.error('Error saving data:', err);
        throw err;
    }
    return model.toJSON();
};

export const updateWorkedHours = async (id: string, workedHours: WorkedHours) => {
    if (!workedHours.date) {
        console.error('Error: Missing date in the input for updating worked hours.');
        throw new InputError('Date is required. Please provide a date in the format yyyy-MM-dd.');
    }
    if (!isValidKey(workedHours.date)) {
        console.error(`Error: Invalid date format provided: ${workedHours.date}`);
        throw new InputError('Invalid date format. Ensure the date is in the format yyyy-MM-dd.');
    }
    
    try {
        const result = await WorkedHoursModel.findByIdAndUpdate(id, workedHours, { new: true });
        if (!result) {
            throw new InputError('No record found with the given ID.');
        }
        console.log('Record updated successfully, id: ' + id);
        console.log(result.toJSON());
        return result.toJSON();
    } catch (err) {
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
        console.log('Record deleted successfully, id: ' + id);
    } catch (err) {
        console.error('Error deleting record:', err);
        throw err;
    }
};

export const getWorkedHours = async (year: number, month: number, day: number): Promise<WorkedHours[]> => {
    const key = createKey(year, month, day);
    if (!isValidKey(key)) {
        console.error('date: ' + key);
        throw new InputError('Invalid date format. Please use yyyy-MM-dd format.');
    }
    try {
        const data = await WorkedHoursModel.find({ date: key });

        console.log('getWorkedHours: ');
        console.log(data);
        return data || [];
    } catch (err) {
        console.error('Error retrieving data for getWorkedHours:', err);
        throw err;
    }
};

export const getMonthWorkedHours = async (year: number, month: number): Promise<WorkedHours[]> => {
    let prefix = createKey(year, month, 1)
    if (!isValidKey(prefix)) {
        prefix = prefix.slice(0, 7);
        console.error('date: ' + prefix);
        throw new InputError('Invalid date format. Please use yyyy-MM-dd format.');
    }

    prefix = prefix.slice(0, 7);

    try {
        const data = await WorkedHoursModel.find({ date: { $regex: `^${prefix}` } });
        return data || [];
    } catch (err) {
        console.error('Error retrieving data for getMonthWorkedHours:', err);
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
