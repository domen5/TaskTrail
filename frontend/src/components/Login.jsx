import Modal from "./Modal";
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";

function Login({ onClose, defaultRedirect = '/home' }) {
    const { login } = useContext(AuthContext);
    const [isPasswordNotEmpty, setIsPasswordNotEmpty] = useState(false);
    const [isUsernameNotEmpty, setIsUsernameNotEmpty] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const title = 'Login';
    const [formData, setFormData] = useState({
        username: '',
        inputPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        if (id === 'inputPassword') {
            // TODO: Add password validation with at least 8 characters and two of the following: uppercase letters, lowercase letters, numbers, and symbols
            setIsPasswordNotEmpty(value.trim() !== '');
        }
        if (id === 'username') {
            setIsUsernameNotEmpty(value.trim() !== '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.username, formData.inputPassword);
            // Use the intended route from location state or fall back to defaultRedirect
            const redirectTo = location.state?.from?.pathname ?? defaultRedirect;
            navigate(redirectTo);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <label htmlFor="inputPassword" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="inputPassword"
                        aria-describedby="passwordHelpBlock"
                        value={formData.inputPassword}
                        onChange={handleChange}
                    />
                    <div id="passwordHelpBlock" className="form-text">
                        Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols
                    </div>
                    <div className="button-group">
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-success" disabled={!isUsernameNotEmpty || !isPasswordNotEmpty}>Submit</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default Login;
