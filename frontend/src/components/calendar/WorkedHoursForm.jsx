import './WorkedHoursForm.css';

function WorkedHoursForm({
    projects = [
        {
            name: "project1",
            value: "Project 1"
        },
        {
            name: "project2",
            value: "Project 2"
        },
        {
            name: "project3",
            value: "Project 3"
        },
        {
            name: "Ultra super duper big long large project name",
            value: "Ultra super duper big long large project name"
        }
    ],
    defaultProject = "project1",
    defaultHours = 1,
    defaultDescription = "",
    defaultOvertime = false,
    handleSubmit,
    onClose }) {
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="project" className="form-label">Project:</label>
                <select
                    id="project"
                    name="project"
                    className="form-select"
                    aria-label="Select project"
                    defaultValue={defaultProject}
                >
                    {projects.map((project, index) => (
                        <option key={index} value={project.name}>
                            {project.value}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="workedHours" className="form-label">Worked Hours:</label>
                <input
                    type="number"
                    id="workedHours"
                    name="workedHours"
                    min="1"
                    max="24"
                    className="form-control"
                    aria-label="Enter worked hours"
                    placeholder="Enter hours worked"
                    defaultValue={defaultHours}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="form-control"
                    aria-label="Enter description"
                    placeholder="Enter a brief description"
                    defaultValue={defaultDescription}
                ></textarea>
            </div>

            <div className="mb-3">
                <label className="form-label d-block">Overtime:</label>
                <div className="d-flex gap-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="inlineRadioOptions"
                            id="inlineRadio1"
                            value="option1"
                            defaultChecked={defaultOvertime}
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
                            defaultChecked={!defaultOvertime}
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
    );
}

export default WorkedHoursForm;