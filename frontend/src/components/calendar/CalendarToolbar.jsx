import { useTimeSheet } from '../../context/TimeSheetContext';

function CalendarToolbar({ setSelectedDay, selectedDay, isMonthLocked }) {
    const { getMonthData, lockMonth, unlockMonth, isMonthLocked: contextIsMonthLocked } = useTimeSheet();
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

    const handleToggleLockMonth = async () => {
        try {
            if (contextIsMonthLocked(selectedDay.getFullYear(), selectedDay.getMonth())) {
                await unlockMonth(selectedDay.getFullYear(), selectedDay.getMonth());
            } else {
                await lockMonth(selectedDay.getFullYear(), selectedDay.getMonth());
            }
        } catch (error) {
            console.error('Failed to toggle month lock:', error);
            alert('Failed to toggle month lock.');
        }
    };

    const handleExport = async () => {
        let monthData = await getMonthData(selectedDay.getFullYear(), selectedDay.getMonth());
        if (Object.keys(monthData).length === 0) {
            alert('No data available for selected month.');
            return;
        }

        const flatMonthData = Object.values(monthData).flat();

        const csvConvertedData = convertToCsv(flatMonthData, separator);
        const blob = new Blob([csvConvertedData], { type: 'text/csv;charset=utf-8,' });

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
            <div className="button-group" style={{ justifyContent: 'start' }}>
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
                    onClick={handleToggleLockMonth}
                >
                    {contextIsMonthLocked(selectedDay.getFullYear(), selectedDay.getMonth()) ? <i className="fas fa-lock-open" /> : <i className="fas fa-lock" />} {contextIsMonthLocked(selectedDay.getFullYear(), selectedDay.getMonth()) ? 'Unlock Month' : 'Lock Month'}
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
