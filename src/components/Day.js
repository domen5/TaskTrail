import React, { useState } from "react";
import "./Day.css";
import DayForm from "./DayForm";  // Make sure this path matches your file structure

function Day(props) {
    const [showForm, setShowForm] = useState(false);

    const handleClick = () => {
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
    };

    return (
        <>
            <div className="day" onClick={handleClick}>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                    {props.dayNumber + 1}
                </p>
            </div>

            {showForm && (
                <>
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 999
                        }}
                        onClick={handleClose}
                    />
                    <DayForm 
                        dayNumber={props.dayNumber + 1} 
                        onClose={handleClose}
                    />
                </>
            )}
        </>
    );
}

export default Day;