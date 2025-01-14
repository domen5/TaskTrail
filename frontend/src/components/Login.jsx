import Modal from "./Modal";
import { validateEmail } from "../utils/utils";
import React, { useState } from "react";

function Login({ onClose }) {

    const title = 'Register';
    const [formData, setFormData] = useState({
        emailAddress: '',
        inputPassword: ''
    });
    const [isEmailValid, setIsEmailValid] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        if (id === 'emailAddress') {
            setIsEmailValid(validateEmail(value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement form submission logic
        console.log('Form submitted:', formData);
        setFormData({
            emailAddress: '',
            inputPassword: ''
        });
        onClose();
    };

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="emailAddress" className="form-label">Email address</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        id="emailAddress" 
                        placeholder="name@example.com"
                        value={formData.emailAddress} 
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
                        <button type="submit" className="btn btn-success" disabled={!isEmailValid}>Submit</button>
                    </div>
                </div>
            </form>
        </Modal>
    );

}

export default Login;