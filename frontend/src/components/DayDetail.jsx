import "./DayDetail.css";
import { useTimeSheet } from "../context/TimeSheetContext";

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
                <div className="row">
                    <div className="col" style={{"margin": "auto"}}>
                        <p className="day-details-date">{date.toLocaleDateString()}</p>
                    </div>
                    <div className="col">
                        <div className="btn-group">
                            <button className="btn btn-success" onClick={handleClickAddForm}>
                                <i className="fa fa-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
                {dayEntries.length > 0 && (
                    <div className="day-details-inner">
                        <p className="day-details-total-hours"><strong>Total: {totalHours}h</strong></p>
                        {dayEntries.map((entry, index) => {
                            return (
                                <div key={index} className="day-details-entry">
                                    <div className="day-details-entry-header">
                                        <p><strong>{entry.project || "N/A"}</strong></p>
                                        <div className="btn-group day-details-align-right">
                                            <button className="btn btn-success" onClick={handleClickEditForm}>
                                                <i className="fas fa-edit" aria-hidden="true"></i>
                                            </button>
                                            <button className="btn btn-danger" onClick={() => deleteFunc(entry._id)}>
                                                <i className="fa-solid fa-x" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <p>{entry.hours || 0}h: {entry.description || "No description"}</p>
                                </div>
                            )
                        }
                        )}
                    </div>
                )}
            </div>
        </>);
}
