import React, { createContext, useContext, useState } from 'react';

// Create the context
const TimeSheetContext = createContext(undefined);

// Create the provider component
export function TimeSheetProvider({ children }) {
    const [timeSheetData, setTimeSheetData] = useState({});

    const updateDayData = async (dayNumber, formData) => {        
        setTimeSheetData(prev => ({
            ...prev,
            [dayNumber]: [...(prev[dayNumber] || []), formData]
        }));

        try {
            // TODO: add api call
        } catch (error) {
            console.error('Error updating timesheet:', error);
            setTimeSheetData(prev => {
                const newData = { ...prev };
                delete newData[dayNumber];
                return newData;
            });
        }
    };

    // Create the value object to be provided
    const value = {
        timeSheetData,
        updateDayData
    };

    return (
        <TimeSheetContext.Provider value={value}>
            {children}
        </TimeSheetContext.Provider>
    );
}

// Custom hook to use the context
export function useTimeSheet() {
    const context = useContext(TimeSheetContext);
    if (context === undefined) {
        throw new Error('useTimeSheet must be used within a TimeSheetProvider');
    }
    return context;
}