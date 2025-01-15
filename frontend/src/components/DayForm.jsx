import { useTimeSheet } from "../context/TimeSheetContext";
import Modal from './Modal';
import './DayForm.css';

function DayForm({ date, onClose }) {
    const { updateDayData } = useTimeSheet();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            date: date.toLocaleDateString(),
            project: e.target.project.value,
            workedHours: parseInt(e.target.workedHours.value),
            description: e.target.description.value,
            overtime: e.target.inlineRadioOptions.value === 'option1',
        };
        await updateDayData(date, formData);
        onClose();
    };

    return (
        <Modal title="Edit Day" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="project">Project:</label>
                    <select
                        id="project"
                        name="project"
                        className="form-select"
                        aria-label="Select project"
                        defaultValue="project1"
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
                        className="form-control"
                        aria-label="Enter worked hours"
                        placeholder="Enter hours worked"
                        defaultValue="1"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="form-control"
                        aria-label="Enter description"
                        placeholder="Enter a brief description"
                        defaultValue=""
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
                                defaultChecked={true}
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
        </Modal>
    );
}

export default DayForm;
