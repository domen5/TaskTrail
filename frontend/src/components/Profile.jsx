import { useTheme } from "../context/ThemeContext";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Profile() {
    const { isDarkMode, setIsDarkMode } = useTheme();
    const { logout } = useContext(AuthContext);

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
            <button onClick={logout} className="btn btn-primary mt-3">
                Logout
            </button>
        </div>
    );
}

export default Profile;