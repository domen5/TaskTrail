import React from 'react';
import './Modal.css';

function Modal({ title, onClose, children }) {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="form-container">
                <h3 className="form-title">{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default Modal;