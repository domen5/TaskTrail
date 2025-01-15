import React from 'react';
import { useTimeSheet } from '../context/TimeSheetContext';

function CalendarToolbar({ setSelectedDay, selectedDay }) {
    const { getMonthData } = useTimeSheet();
    // TODO: add the possibility to choose a different delimiter
    const separator = ';';

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

    const convertToCsv = (data, separator) => {
        if (data.length === 0) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const rows = data.map(item =>
            headers.map(header => item[header]).join(separator)
        );

        return [headers.join(separator), ...rows].join('\n');
    }

    const handleExport = () => {
        const monthData = getMonthData(selectedDay.getFullYear(), selectedDay.getMonth());

        if (monthData.length === 0) {
            alert('No data available for selected month.');
            return;
        }
        
        const csvConvertedData = convertToCsv(monthData, separator);
        const blob = new Blob([csvConvertedData], { type: 'text/csv;charset=utf-8,' });

        console.log(csvConvertedData);
        // TODO: design a better way to start the download
        // This is a fast way to trigger the download, by programmatically create a hidden <a> helement,
        // force a click and dispose of the tag.
        const url = URL.createObjectURL(blob);
        const filename = `report_${selectedDay.getFullYear()}_${selectedDay.getMonth() + 1}.csv`;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.style.display = 'none'; // Hide the link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="button-group" style={{ justifyContent: 'start', marginLeft: '1ex' }}>
                <button
                    className="btn btn-success"
                    onClick={handlePrevMonth}
                >
                    {'<'} Previous Month
                </button>
                <button
                    className="btn btn-success"
                    onClick={handleNextMonth}
                >
                    Next Month {'>'}
                </button>
                <button
                    className="btn btn-success"
                    onClick={handleExport}
                >
                    Export Monthly Report
                </button>
            </div>
        </div>
    );
}

export default CalendarToolbar;
