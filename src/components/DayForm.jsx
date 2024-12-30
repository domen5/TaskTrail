import { useTimeSheet } from "../context/TimeSheetContext";
import './DayForm.css';

function DayForm({ dayNumber, onClose, initialData }) {
    const { updateDayData } = useTimeSheet();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            project: e.target.project.value,
            workedHours: parseInt(e.target.workedHours.value),
            description: e.target.description.value,
            overtime: e.target.inlineRadioOptions.value === 'option1',
        };
        await updateDayData(dayNumber, formData);
        onClose();
    };

    return (
        <div className="form-container">
            <h3 className="form-title">Day {dayNumber}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="project">Project:</label>
                    <select
                        id="project"
                        name="project"
                        className="form-control input-control"
                        aria-label="Select project"
                        defaultValue={initialData?.project || "project1"} // Default to Project 1
                    >
                        <option value="project1">Project 1</option>
                        <option value="project2">Project 2</option>
                        <option value="project3">Project 3</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="workedHours">Worked Hours:</label>
                    <input
                        type="number"
                        id="workedHours"
                        name="workedHours"
                        min="1"
                        max="24"
                        className="form-control input-control"
                        aria-label="Enter worked hours"
                        placeholder="Enter hours worked"
                        defaultValue={initialData?.workedHours || ''}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="form-control input-control"
                        aria-label="Enter description"
                        placeholder="Enter a brief description"
                        defaultValue={initialData?.description || ''}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Overtime:</label>
                    <div className="radio-group">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="inlineRadioOptions"
                                id="inlineRadio1"
                                value="option1"
                                defaultChecked={initialData?.overtime === true}
                            />
                            <label className="form-check-label" htmlFor="inlineRadio1">Yes</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="inlineRadioOptions"
                                id="inlineRadio2"
                                value="option2"
                                defaultChecked={
                                    initialData?.overtime === undefined || initialData?.overtime === false
                                } // Default to "No" if overtime is undefined or explicitly false
                            />
                            <label className="form-check-label" htmlFor="inlineRadio2">No</label>
                        </div>
                    </div>
                </div>

                <div className="button-group">
                    <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-success">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default DayForm;
