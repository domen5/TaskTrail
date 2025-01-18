import mongoose from 'mongoose';
import WorkedHours, { WorkedHoursModel } from "../models/WorkedHours";
import { MONGODB_URI } from "../config";
import { InputError } from '../utils/errors';

const timeSheetData: { [key: string]: WorkedHours[] } = {};

run().catch(err => console.log(err));

async function run() {
    const connect = async () => {
        mongoose.connect(MONGODB_URI)
            .then(() => console.log('Connected to database tasktrail'))
            .catch((err) => console.log(err));
    }
    await connect();
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
        console.log('Data saved successfully');
    } catch (err) {
        console.error('Error saving data:', err);
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

export const getMonthWorkedHours = (year: number, month: number): { [key: string]: WorkedHours[] } => {
    const prefix = createKey(year, month, 1).slice(0, 7);
    const monthData: { [key: string]: WorkedHours[] } = {};

    Object.entries(timeSheetData)
        .filter(([key]) => key.startsWith(prefix))
        .forEach(([key, dayData]) => {
            monthData[key] = dayData;
        });

    return monthData;
};

export const getAllWorkedHours = (): { [key: string]: WorkedHours[] } => {
    return timeSheetData;
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
