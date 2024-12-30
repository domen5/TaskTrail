import React, { useState } from "react";
import "./Day.css";
import DayForm from "./DayForm";
import { useTimeSheet } from "../context/TimeSheetContext";

function Day({ dayNumber }) {
    const [showForm, setShowForm] = useState(false);
    const { timeSheetData } = useTimeSheet();

    const dayData = timeSheetData?.[dayNumber + 1];

    const handleClick = () => setShowForm(true);
    const handleClose = () => setShowForm(false);

    return (
        <>
            <div className="day" onClick={handleClick}>
                <p className="day-number">{dayNumber + 1}</p>
                {dayData && (
                    <div className="day-details">
                        <p><strong>Project:</strong> {dayData.project || "N/A"}</p>
                        <p><strong>Hours:</strong> {dayData.workedHours || 0}h</p>
                        <p><strong>Description:</strong> {dayData.description || "No description"}</p>
                        <p>
                            <strong>Overtime:</strong> {dayData.overtime ? "Yes" : "No"}
                        </p>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="day-form-overlay" onClick={handleClose} role="dialog" aria-modal="true">
                    <div className="day-form-container" onClick={(e) => e.stopPropagation()}>
                        <DayForm
                            dayNumber={dayNumber + 1}
                            onClose={handleClose}
                            initialData={dayData}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default Day;
