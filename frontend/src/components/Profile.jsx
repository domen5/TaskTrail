import { useState } from "react";
import Login from "./Login";

function Profile() {
    const [showForm, setShowForm] = useState(true);
    
    const handleClose = () => setShowForm(false);

    return (
        <div className="container">
            <h1>Profile</h1>
            <p>This page is under construction.</p>
            {showForm && (
                <div className="day-form-overlay" onClick={handleClose} role="dialog" aria-modal="true">
                    <div className="day-form-container" onClick={(e) => e.stopPropagation()}>
                        <Login onClose={handleClose}></Login>
                    </div>
                </div>
            )}
        </div>


    );
}

export default Profile;