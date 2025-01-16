import React, { createContext, useContext, useState } from 'react';
import { fetchMonthData, postDayData } from '../components/api/api';
import { createKey } from '../utils/utils';

const TimeSheetContext = createContext(undefined);

export function TimeSheetProvider({ children }) {
    const [timeSheetData, setTimeSheetData] = useState({});

    const getDayData = (date) => {
        const key = createKey(date);
        return timeSheetData[key] || [];
    };

    // Assumes 0-based months; Triggers update od timeSheetData;
    const getMonthData = async (year, month) => {
        const newMonthData = await fetchMonthData(year, month);
        const prefix = createKey(new Date(year, month, 1)).slice(0, 7); // "yyyy-MM"

        setTimeSheetData(prev => {
            const cleanedData = Object.fromEntries(
                Object.entries(prev).filter(([key]) => !key.startsWith(prefix))
            );

            return {
                ...cleanedData,
                ...newMonthData
            };
        });

        return newMonthData;
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
            postDayData(date, formData);
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
