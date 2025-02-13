import React, { createContext, useContext, useState } from 'react';
import {
    getMonthWorkedHoursApiCall,
    createWorkedHoursApiCall,
    updateWorkedHoursApiCall,
    deleteWorkedHoursApiCall,
    lockMonthApiCall,
    verifyLockedMonthApiCall
} from '../api/api';

const TimeSheetContext = createContext(undefined);

const getDateKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const getMonthKey = (year, month) => {
    const d = new Date(year, month, 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

export function TimeSheetProvider({ children }) {
    const [timeSheetData, setTimeSheetData] = useState({});
    const [lockedMonths, setLockedMonths] = useState({});

    const getDayData = (date) => {
        const key = getDateKey(date);
        return timeSheetData[key] || [];
    };

    // Assumes 0-based months; Triggers update of timeSheetData;
    const getMonthData = async (year, month) => {
        const newMonthData = await getMonthWorkedHoursApiCall(year, month);
        const monthStart = getMonthKey(year, month);

        // Convert the API response to use timestamp keys
        const processedData = Object.values(newMonthData).flat().reduce((acc, entry) => {
            const key = getDateKey(entry.date);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(entry);
            return acc;
        }, {});

        setTimeSheetData(prev => {
            // Remove old entries for this month
            const cleanedData = Object.entries(prev).reduce((acc, [key, value]) => {
                const entryDate = new Date(parseInt(key));
                if (entryDate.getFullYear() !== year || entryDate.getMonth() !== month) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            return {
                ...cleanedData,
                ...processedData
            };
        });

        return processedData;
    };

    const updateDayData = async (formData) => {
        if (!formData.date || !(formData.date instanceof Date)) {
            throw new Error('Invalid date in formData');
        }

        const key = getDateKey(formData.date);

        try {
            const response = await createWorkedHoursApiCall(formData);
            const updatedFormData = response;

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
            throw error;
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
            await deleteWorkedHoursApiCall(id);
        } catch (error) {
            console.error('Error deleting worked hours:', error);
            // Revert to previous state in case of an error
            setTimeSheetData(previousState);
        }
    };

    const updateWorkedHours = async (workedHours) => {
        // Ensure we're working with a Date object
        const date = workedHours.date instanceof Date ? workedHours.date : new Date(workedHours.date);
        const key = getDateKey(date);

        // Optimistically update the state
        let previousState;
        setTimeSheetData(prev => {
            previousState = { ...prev };
            const updatedData = { ...prev };
            if (updatedData[key]) {
                updatedData[key] = updatedData[key].map(entry =>
                    entry._id === workedHours._id ? {
                        ...workedHours,
                        date
                    } : entry
                );
            }
            return updatedData;
        });

        try {
            const response = await updateWorkedHoursApiCall({
                ...workedHours,
                date
            });
            // Update with the response from the server
            setTimeSheetData(prev => {
                const updatedData = { ...prev };
                if (updatedData[key]) {
                    updatedData[key] = updatedData[key].map(entry =>
                        entry._id === response._id ? response : entry
                    );
                }
                return updatedData;
            });
        } catch (error) {
            console.error('Error updating worked hours:', error);
            // Revert to previous state in case of an error
            setTimeSheetData(previousState);
        }
    };

    const lockMonth = async (year, month) => {
        // Optimistically update the state
        const previousState = { ...lockedMonths };
        setLockedMonths(prev => ({ ...prev, [`${year}-${month}`]: true }));

        try {
            const response = await lockMonthApiCall(year, month, true);
            return response;
        } catch (error) {
            console.error('Error locking month:', error);
            // Revert to previous state in case of an error
            setLockedMonths(previousState);
            throw error;
        }
    };

    const unlockMonth = async (year, month) => {
        // Optimistically update the state
        const previousState = { ...lockedMonths };
        setLockedMonths(prev => ({ ...prev, [`${year}-${month}`]: false }));

        try {
            const response = await lockMonthApiCall(year, month, false);
            return response;
        } catch (error) {
            console.error('Error unlocking month:', error);
            // Revert to previous state in case of an error
            setLockedMonths(previousState);
            throw error;
        }
    };

    const isMonthLocked = (year, month) => {
        return lockedMonths[`${year}-${month}`] || false;
    };

    // Triggers an API call
    const checkAndSetLockedMonth = async (year, month) => {
        const previousState = { ...lockedMonths };
        try {
            const isLocked = await verifyLockedMonthApiCall(year, month);
            setLockedMonths(prev => ({ ...prev, [`${year}-${month}`]: isLocked }));
        } catch (error) {
            console.error('Error checking locked month:', error);
            // Revert to previous state in case of an error
            setLockedMonths(previousState);
        }
    };

    const value = {
        getDayData,
        getMonthData,
        updateDayData,
        updateWorkedHours,
        deleteWorkedHours,
        lockMonth,
        unlockMonth,
        checkAndSetLockedMonth,
        isMonthLocked
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
