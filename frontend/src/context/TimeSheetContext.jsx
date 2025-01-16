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

    // Get month data from the backend; Assumes 0 based months
    const fetchMonthData = async (year, month) => {
        const response = await fetch(`http://localhost:3000/api/worked-hours/${year}/${month + 1}`);
        if (!response.ok) {
            throw new Error('Failed to fetch month data from backend');
        }
        const data = await response.json();
        return data;
    };

    const postDayData = async (date, formData) => {
        const url = `http://localhost:3000/api/worked-hours`;
        const dateId = createKey(date);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: dateId,
                formData: formData
            })
        });
        if (!response.ok) {
            throw new Error('Failed post day data to backend');
        }
        const data = await response.json();
        return data;

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
