import WorkedHours from "../models/WorkedHours";

const timeSheetData: { [key: string]: WorkedHours[] } = {};

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

export const addWorkedHours = (date: string, formData: WorkedHours) => {
    if(!isValidKey(date)) {
        console.error('date: ' + date)
        throw new Error('Invalid date format. Please use yyyy-MM-dd format.');
    }
    if (!timeSheetData[date]) {
        timeSheetData[date] = [];
    }
    timeSheetData[date].push(formData);
};

export const getWorkedHours = (year: number, month: number, day: number): WorkedHours[] => {
    const key = createKey(year, month, day);
    return timeSheetData[key] || [];
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