import React, { useState } from "react";
import "./Day.css";
import DayForm from "./DayForm";
import { useTimeSheet } from "../context/TimeSheetContext";

function Day({ dayNumber, isPadded }) {
    const [showForm, setShowForm] = useState(false);
    const { timeSheetData } = useTimeSheet();

    const dayEntries = timeSheetData?.[dayNumber + 1] || [];
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.workedHours || 0), 0);

    const handleClick = () => setShowForm(true);
    const handleClose = () => setShowForm(false);

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
                                <p>{entry.workedHours || 0}h: {entry.description || "No description"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="day-form-overlay" onClick={handleClose} role="dialog" aria-modal="true">
                    <div className="day-form-container" onClick={(e) => e.stopPropagation()}>
                        <DayForm
                            dayNumber={dayNumber + 1}
                            onClose={handleClose}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default Day;
