import Modal from "./Modal";
// import { validateEmail } from "../utils/utils";
import React, { useState } from "react";
// import { Signup } from "../api/auth";

function Signup({ onClose }) {
    // Temporarily disable email validation
    // const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordNotEmpty, setIsPasswordNotEmpty] = useState(false);
    const [isUsernameNotEmpty, setIsUsernameNotEmpty] = useState(false);
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

    const title = 'Signup';
    const [formData, setFormData] = useState({
        // emailAddress: '',
        username: '',
        inputPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        // TODO: Add email validation
        // if (id === 'emailAddress') {
        //     setIsEmailValid(validateEmail(value));
        // }
        if (id === 'inputPassword' || id === 'confirmPassword') {
            // TODO: Add password validation with at least 8 characters and two of the following: uppercase letters, lowercase letters, numbers, and symbols
            setIsPasswordNotEmpty(formData.inputPassword.trim() !== '');
            setIsPasswordConfirmed(formData.inputPassword === value || formData.confirmPassword === value);
        }
        if (id === 'username') {
            setIsUsernameNotEmpty(value.trim() !== '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.inputPassword !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        await Signup(formData.username, formData.inputPassword);

        setFormData({
            // emailAddress: '',
            username: '',
            inputPassword: '',
            confirmPassword: ''
        });
        onClose();
    };

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    {/* <label htmlFor="emailAddress" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="emailAddress"
                        placeholder="name@example.com"
                        value={formData.emailAddress}
                        onChange={handleChange}
                    /> */}
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Choose a username"
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
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <div id="passwordHelpBlock" className="form-text">
                        Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols
                    </div>
                    <div className="button-group">
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className="btn btn-success" 
                            disabled={!isUsernameNotEmpty || !isPasswordNotEmpty || !isPasswordConfirmed}>
                            Signup
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default Signup;