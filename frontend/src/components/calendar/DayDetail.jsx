import { useTimeSheet } from "../../context/TimeSheetContext";
import { useTheme } from "../../context/ThemeContext";

export default function DayDetail({ date, handleClickEditForm, handleClickAddForm, isMonthLocked }) {
    const { getDayData, deleteWorkedHours } = useTimeSheet();
    const { isDarkMode } = useTheme();

    const dayEntries = getDayData(date);
    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const deleteFunc = async (id) => {
        await deleteWorkedHours(id);
    };

    return (
        <div className={`card ${isDarkMode ? 'bg-dark text-light' : ''} h-100`}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">{date.toLocaleDateString()}</h5>
                    <button className="btn btn-success btn-sm" onClick={handleClickAddForm} disabled={isMonthLocked}>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
                
                {dayEntries.length > 0 && (
                    <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                        <p className={`fw-bold border-bottom pb-2 ${isDarkMode ? 'border-secondary' : ''}`}>
                            Total: {totalHours}h
                        </p>
                        {dayEntries.map((entry, index) => (
                            <div 
                                key={index} 
                                className={`p-2 mb-2 rounded border-start border-3 ${
                                    isDarkMode 
                                        ? entry.overtime ? 'bg-danger-subtle text-light border-danger' : 'bg-dark-subtle text-light border-success'
                                        : entry.overtime ? 'bg-danger-subtle border-danger' : 'bg-light border-success'
                                }`}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <p className="fw-bold mb-1">{entry.project || "N/A"}</p>
                                    <div className="btn-group">
                                        <button 
                                            className="btn btn-success btn-sm" 
                                            onClick={() => handleClickEditForm(entry)}
                                            disabled={isMonthLocked}
                                        >
                                            <i className="fas fa-edit" aria-hidden="true"></i>
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={() => deleteFunc(entry._id)}
                                            disabled={isMonthLocked}
                                        >
                                            <i className="fa-solid fa-x" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                                <p className={`mb-0 small ${isDarkMode ? 'text-light-emphasis' : 'text-muted'}`}>
                                    {entry.hours || 0}h: {entry.description || "No description"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
