import React, { createContext, useContext, useState } from 'react';
import { fetchMonthData, postDayData, deleteWorkedHoursRequest } from '../api/api';
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
        // console.log(`Retrieving new data for ${year}/${month+1}`);
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
        const key = createKey(date);

        // TODO: Check form data

        try {
            const response = await postDayData(date, formData);
            const updatedFormData = { ...formData, _id: response._id };

            setTimeSheetData(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), updatedFormData],
            }));
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

    const deleteWorkedHours = async (id) => {
        // Optimistically update the state
        let previousState;
        setTimeSheetData(prev => {
            previousState = { ...prev };
            const updatedData = { ...prev };
            for (const key in updatedData) {
                updatedData[key] = updatedData[key].filter(entry => entry._id !== id);
                if (updatedData[key].length === 0) {
                    delete updatedData[key];
                }
            }
            return updatedData;
        });

        try {
            await deleteWorkedHoursRequest(id);
        } catch (error) {
            console.error('Error deleting worked hours:', error);
            // Revert to previous state in case of an error
            setTimeSheetData(previousState);
        }
    };

    const value = {
        getDayData,
        getMonthData,
        updateDayData,
        deleteWorkedHours
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
