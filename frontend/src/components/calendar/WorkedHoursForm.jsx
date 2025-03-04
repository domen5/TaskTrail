import './WorkedHoursForm.css';
import React, { useState } from 'react';

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

    const [project, setProject] = useState(defaultProject);
    const [workedHours, setWorkedHours] = useState(defaultHours);
    const [description, setDescription] = useState(defaultDescription);
    const [overtime, setOvertime] = useState(defaultOvertime);

    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit({ project, workedHours, description, overtime });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <div className="mb-3">
                <label htmlFor="project" className="form-label">Project:</label>
                <select
                    id="project"
                    name="project"
                    className="form-select"
                    aria-label="Select project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
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
                    value={workedHours}
                    onChange={(e) => setWorkedHours(Number(e.target.value))}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>

            <div className="mb-3">
                <fieldset className="border-0 p-0">
                    <legend className="form-label mb-2">Overtime:</legend>
                    <div className="d-flex gap-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="overtime"
                                id="overtimeYes"
                                value="yes"
                                checked={overtime}
                                onChange={() => setOvertime(true)}
                            />
                            <label className="form-check-label" htmlFor="overtimeYes">Yes</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="overtime"
                                id="overtimeNo"
                                value="no"
                                checked={!overtime}
                                onChange={() => setOvertime(false)}
                            />
                            <label className="form-check-label" htmlFor="overtimeNo">No</label>
                        </div>
                    </div>
                </fieldset>
            </div>

            <div className="button-group">
                <button type="button" className="btn btn-danger" onClick={typeof onClose === 'function' ? onClose : () => console.warn('onClose is not a function')}>Cancel</button>
                <button type="submit" className="btn btn-success">Submit</button>
            </div>
        </form>
    );
}

export default WorkedHoursForm;