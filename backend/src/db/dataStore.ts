interface FormData {
    date: string,
    project: string,
    workedHours: number,
    description: string,
    overtime: boolean,
}

const timeSheetData: { [key: string]: FormData[] } = {};

const createKey = (year: number, month: number, day: number): string => {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

export const addWorkedHours = (formData: FormData) => {
    const key = formData.date;
    if (!timeSheetData[key]) {
        timeSheetData[key] = [];
    }
    timeSheetData[key].push(formData);
};

export const getWorkedHours = (year: number, month: number, day: number): FormData[] => {
    const key = createKey(year, month, day);
    return timeSheetData[key] || [];
};

export const getAllWorkedHours = (): { [key: string]: FormData[] } => {
    return timeSheetData;
}; 