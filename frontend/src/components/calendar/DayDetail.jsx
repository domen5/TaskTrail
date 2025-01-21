import "./DayDetail.css";
import { useTimeSheet } from "../../context/TimeSheetContext";

export default function DayDetail({ date, handleClickEditForm, handleClickAddForm }) {
    const { getDayData, deleteWorkedHours } = useTimeSheet();

    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const deleteFunc = async (id) => {
        await deleteWorkedHours(id);
    };

    return (
        <div className="card">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">{date.toLocaleDateString()}</h5>
                    <button className="btn btn-success btn-sm" onClick={handleClickAddForm}>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
                
                {dayEntries.length > 0 && (
                    <div className="day-details-inner">
                        <p className="fw-bold border-bottom pb-2">Total: {totalHours}h</p>
                        {dayEntries.map((entry, index) => (
                            <div key={index} className="day-details-entry p-2 mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <p className="fw-bold mb-1">{entry.project || "N/A"}</p>
                                    <div className="btn-group">
                                        <button className="btn btn-success btn-sm" onClick={() => handleClickEditForm(entry)}>
                                            <i className="fas fa-edit" aria-hidden="true"></i>
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteFunc(entry._id)}>
                                            <i className="fa-solid fa-x" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-0">{entry.hours || 0}h: {entry.description || "No description"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
