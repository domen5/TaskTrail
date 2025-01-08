import React, { createContext, useContext, useState } from 'react';

const TimeSheetContext = createContext(undefined);

export function TimeSheetProvider({ children }) {
    const [timeSheetData, setTimeSheetData] = useState({});

    const createKey = (year, month, day) => {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    const getDayData = (year, month, day) => {
        const key = createKey(year, month, day);
        return timeSheetData[key] || [];
    };

    const getMonthData = (year, month) => {
        const prefix = `${year}-${month.toString().padStart(2, '0')}`;
        return Object.entries(timeSheetData)
            .filter(([key]) => key.startsWith(prefix))
            .flatMap(([, dayData]) => dayData);
    };

    const updateDayData = async (year, month, day, formData) => {
        const key = createKey(year, month, day);
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
