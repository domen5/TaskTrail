import { useState, useEffect } from "react";
import Login from "./Login";

function Profile() {
    const [showForm, setShowForm] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const handleClose = () => setShowForm(false);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <div className="container">
            <h1>Profile</h1>
            <p>This page is under construction.</p>
            <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="darkModeSwitch"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
                <label className="form-check-label" htmlFor="darkModeSwitch">
                    Dark Mode
                </label>
            </div>
            {/* {showForm && (
                <Login onClose={handleClose} />
            )} */}
        </div>
    );
}

export default Profile;