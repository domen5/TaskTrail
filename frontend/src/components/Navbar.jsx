import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

function Navbar() {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navbarClass = isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white border-bottom';
    const brandColor = isDarkMode ? '#98ff98' : '#198754';

    return (
        <nav className={`navbar navbar-expand-lg fixed-top shadow-sm ${navbarClass}`}>
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/" style={{color: brandColor}}>
                    <i className="fas fa-chart-line me-2"></i>
                    Task Trail
                </Link>
                <button 
                    className="navbar-toggler border-0" 
                    type="button" 
                    onClick={toggleMenu}
                    aria-controls="navbarNav" 
                    aria-expanded={isOpen} 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/">
                                <i className="fas fa-home me-2"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/calendar">
                                <i className="fas fa-calendar-alt me-2"></i>Calendar
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/about">
                                <i className="fas fa-info-circle me-2"></i>About
                            </Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <Link
                            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                            to="/profile"
                        >
                            <i className="fas fa-user"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
