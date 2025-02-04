import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Login from "./Login";

function Profile() {
    const [showForm, setShowForm] = useState(true);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const handleClose = () => setShowForm(false);
    const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

    return (
        <div className={`container py-4 ${isDarkMode ? 'text-light' : ''}`}>
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
            {showForm && (
                <Login onClose={handleClose} />
            )}
        </div>
    );
}

export default Profile;