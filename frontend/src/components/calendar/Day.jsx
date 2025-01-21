import "./Day.css";
import { useTimeSheet } from "../../context/TimeSheetContext";

function Day({ date, isPadded, setSelectedDay }) {
    const { getDayData } = useTimeSheet();

    const dayNumber = date.getDate();
    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const handleClick = () => {
        setSelectedDay(date);
    };

    return (
        <div className={`day h-100 ${isPadded ? "padded-day" : ""}`} onClick={handleClick}>
            <p className="fw-bold mb-2">{dayNumber}</p>
            {dayEntries.length > 0 && (
                <div className="day-details">
                    <p className="fw-bold border-bottom pb-1 mb-2">Total: {totalHours}h</p>
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
