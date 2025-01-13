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
                <Login onClose={handleClose} />
            )}
        </div>
    );
}

export default Profile;