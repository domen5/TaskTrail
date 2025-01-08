import React from 'react';
import { useTimeSheet } from '../context/TimeSheetContext';

function CalendarToolbar({ setSelectedDay, selectedDay }) {
    const { getMonthData } = useTimeSheet();

    const handlePrevMonth = () => {
        const prevMonth = new Date(selectedDay);
        prevMonth.setMonth(selectedDay.getMonth() - 1);
        setSelectedDay(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(selectedDay);
        nextMonth.setMonth(selectedDay.getMonth() + 1);
        setSelectedDay(nextMonth);
    };

    const handleExport = () => {
        console.log(getMonthData(selectedDay.getFullYear(), selectedDay.getMonth() + 1));
    };

    return (
        <div>
            <div className="button-group" style={{ justifyContent: 'start', marginLeft: '1ex' }}>
                <button
                    className="btn btn-secondary"
                    onClick={handlePrevMonth}
                >
                    {'<'} Previous Month
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleNextMonth}
                >
                    Next Month {'>'}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleExport}
                >
                    Export Monthly Report
                </button>
            </div>
        </div>
    );
}

export default CalendarToolbar;
