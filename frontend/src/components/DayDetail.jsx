import React, { useState } from "react";
import "./Day.css";
import DayForm from "./DayForm";
import { useTimeSheet } from "../context/TimeSheetContext";

export default function DayDetail({ date, handleClickEditForm, handleClickAddForm }) {

    const { getDayData } = useTimeSheet();

    const dayNumber = date.getDate();
    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    return (
        <>
            <div className={`day`}>
                <p className="day-number">{date.toLocaleDateString()}</p>
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

                <div className="btn-group">
                    <button className="btn btn-success" onClick={handleClickEditForm}>
                        <i className="fas fa-edit" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-success" onClick={handleClickAddForm}>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </>);
}

