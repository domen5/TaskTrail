import React, { createContext, useContext, useState } from 'react';

const TimeSheetContext = createContext(undefined);

export function TimeSheetProvider({ children }) {
    const [timeSheetData, setTimeSheetData] = useState({});

    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date);
    }

    const createKey = (date = new Date()) => {
        if (!isValidDate(date)) {
            throw new Error('Invalid date input. Please provide a valid Date object or a valid date string.');
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getDayData = (date) => {
        const key = createKey(date);
        return timeSheetData[key] || [];
    };

    const getMonthData = (year, month) => {
        const prefix = createKey(new Date(year, month, 1)).slice(0, 7);
        return Object.entries(timeSheetData)
            .filter(([key]) => key.startsWith(prefix))
            .flatMap(([, dayData]) => dayData);
    };

    const updateDayData = async (date, formData) => {
        const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        const key = createKey(date);

        // TODO: Check form data

        setTimeSheetData(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), formData],
        }));

        try {
            // TODO: Add API call here
        } catch (error) {
            console.error('Error updating timesheet:', error);

            // Revert the change in case of an error
            setTimeSheetData(prev => {
                const updatedData = { ...prev };
                updatedData[key] = (updatedData[key] || []).filter(item => item !== formData);

                if (updatedData[key].length === 0) {
                    delete updatedData[key];
                }

                return updatedData;
            });
        }
    };

    const value = {
        getDayData,
        getMonthData,
        updateDayData,
    };

    return (
        <TimeSheetContext.Provider value={value}>
            {children}
        </TimeSheetContext.Provider>
    );
}

export function useTimeSheet() {
    const context = useContext(TimeSheetContext);
    if (context === undefined) {
        throw new Error('useTimeSheet must be used within a TimeSheetProvider');
    }
    return context;
}
