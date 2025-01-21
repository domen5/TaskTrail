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
        <>
            <div className={`day ${isPadded ? "padded-day" : ""}`} onClick={handleClick}>
                <p className="day-number">{dayNumber}</p>
                {dayEntries.length > 0 && (
                    <div className="day-details">
                        <p className="total-hours"><strong>Total: {totalHours}h</strong></p>
                        {dayEntries.map((entry, index) => (
                            <div key={index} className="entry">
                                <p><strong>{entry.project || "N/A"}</strong></p>
                                <p>{entry.hours || 0}h: {entry.description || "No description"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Day;
