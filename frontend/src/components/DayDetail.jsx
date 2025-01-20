import "./DayDetail.css";
import { useTimeSheet } from "../context/TimeSheetContext";
import { useState, useEffect } from "react";

export default function DayDetail({ date, handleClickEditForm, handleClickAddForm }) {
    const { getDayData, deleteWorkedHours } = useTimeSheet();

    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const deleteFunc = async (id) => {
        await deleteWorkedHours(id);
    };

    return (
        <>
            <div className="day-details-component">
                <p className="day-number">{date.toLocaleDateString()}</p>
                {dayEntries.length > 0 && (
                    <div className="day-details">
                        <p className="total-hours"><strong>Total: {totalHours}h</strong></p>
                        {dayEntries.map((entry, index) => {
                            return (
                                <div key={index} className="entry">
                                    <p><strong>{entry.project || "N/A"}</strong></p>
                                    <p>{entry.hours || 0}h: {entry.description || "No description"}</p>
                                    <button className="btn btn-danger" onClick={() => deleteFunc(entry._id)}>
                                        <i className="fa-solid fa-x" aria-hidden="true"></i>
                                    </button>
                                </div>
                            )}
                        )}
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
