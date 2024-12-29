function DayForm({ dayNumber, onClose }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Form submitted for day " + dayNumber);
        onClose();
    };

    const formStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '400px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1000
    }

    const formGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
    }

    const labelStyle = {
        width: '120px',
        marginRight: '10px',
        textAlign: 'right'
    }

    const inputStyle = {
        flex: 1
    }

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    }

    const radioGroupStyle = {
        display: 'flex',
        gap: '15px',
        flex: 1
    }

    return (
        <div style={formStyle}>
            <h3 style={{ marginBottom: '20px' }}>Day {dayNumber}</h3>
            <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                    <label style={labelStyle} htmlFor="project">Project:</label>
                    <select style={inputStyle} id="project" name="project" className="form-control">
                        <option value="project1">Project 1</option>
                        <option value="project2">Project 2</option>
                        <option value="project3">Project 3</option>
                    </select>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle} htmlFor="workedHours">Worked Hours:</label>
                    <input
                        style={inputStyle}
                        type="number"
                        id="workedHours"
                        name="workedHours"
                        min="1"
                        max="24"
                        className="form-control"
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle} htmlFor="description">Description:</label>
                    <textarea
                        style={inputStyle}
                        id="description"
                        name="description"
                        rows="3"
                        className="form-control"
                    ></textarea>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Overtime:</label>
                    <div style={radioGroupStyle}>
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
                            />
                            <label className="form-check-label" htmlFor="inlineRadio2">No</label>
                        </div>
                    </div>
                </div>

                <div style={buttonGroupStyle}>
                    <button type="button" className="btn btn-success" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-danger">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default DayForm;