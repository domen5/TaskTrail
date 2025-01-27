import "./Day.css";
import { useTimeSheet } from "../../context/TimeSheetContext";
import { useTheme } from "../../context/ThemeContext";

function Day({ date, isPadded, setSelectedDay }) {
    const { getDayData } = useTimeSheet();
    const { isDarkMode } = useTheme();

    const dayNumber = date.getDate();
    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const handleClick = () => {
        setSelectedDay(date);
    };

    return (
        <div 
            className={`day ${isDarkMode ? 'bg-dark text-light' : 'bg-light'} ${isPadded ? "padded-day" : ""}`}
            onClick={handleClick}
        >
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">{dayNumber}</span>
                {dayEntries.length > 0 && (
                    <span className={`small ${isDarkMode ? 'text-light' : 'text-secondary'}`}>
                        {totalHours}h
                    </span>
                )}
            </div>
            {dayEntries.length > 0 && (
                <div className="calendar-day-entries">
                    {dayEntries.map((entry, index) => (
                        <div key={index} className="entry p-1 mb-2">
                            <p className="fw-bold mb-1">{entry.project || "N/A"}</p>
                            <p className="mb-0">{entry.hours || 0}h: {entry.description || "No description"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Day;
