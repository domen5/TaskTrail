import "./Day.css";
import { useTimeSheet } from "../../context/TimeSheetContext";
import { useTheme } from "../../context/ThemeContext";

function Day({ date, isPadded, setSelectedDay }) {
    const { getDayData } = useTimeSheet();
    const { isDarkMode } = useTheme();

    const dayNumber = date.getDate();
    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    const isToday = new Date().toDateString() === date.toDateString();

    const handleClick = () => {
        setSelectedDay(date);
    };

    return (
        <div 
            className={`day h-100 d-flex flex-column ${isDarkMode ? 'bg-dark text-light' : 'bg-white'} ${isPadded ? "text-muted" : ""} ${isToday ? 'today' : ''}`}
            onClick={handleClick}
        >
            <div className="d-flex justify-content-between align-items-center p-2">
                <span className={`${isToday ? 'badge rounded-pill bg-success' : ''} ${isPadded ? 'opacity-50' : ''} fs-6`}>
                    {dayNumber}
                </span>
                {dayEntries.length > 0 && (
                    <span className="badge bg-success">
                        {totalHours}h
                    </span>
                )}
            </div>
            {dayEntries.length > 0 && (
                <div className="calendar-day-entries flex-grow-1 px-2 overflow-auto" style={{height: "100px"}}>
                    {dayEntries.map((entry, index) => (
                        <div key={index} 
                            className={`p-2 mb-2 rounded border-start border-3 ${isDarkMode ? 'bg-dark-subtle border-success text-light' : 'bg-light border-success'}`}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-truncate me-2 fw-bold" title={entry.project}>
                                    {entry.project || "N/A"}
                                </div>
                                <div className="flex-shrink-0">
                                    {entry.hours}h
                                </div>
                            </div>
                            <div 
                                className={`small text-truncate d-none d-md-block ${isDarkMode ? 'text-light-emphasis' : 'text-muted'}`}
                                title={entry.description || "No description"}
                            >
                                {entry.description || "No description"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Day;
