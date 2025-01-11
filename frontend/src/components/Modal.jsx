import React from 'react';
import './Modal.css';

function Modal({ title, onClose, children }) {
    return (
        <div className="form-container">
            <h3 className="form-title">{title}</h3>
            {children}
        </div>
    );
}

export default Modal;