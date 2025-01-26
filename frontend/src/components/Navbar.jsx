import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
    const { isDarkMode } = useTheme();

    return (
        <nav className={`navbar navbar-expand-md ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
            <div className="container-fluid">
                <Link className="navbar-brand" to="/" style={{color: isDarkMode ? '#98ff98' : 'green'}}>Task Trail</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/calendar">Calendar</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About</Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link
                                className={`nav-link d-flex align-items-center justify-content-center rounded-circle ${isDarkMode ? 'bg-dark' : 'bg-light'} border`}
                                style={{ width: '40px', height: '40px' }}
                                to="/profile"
                            >
                                <span style={{ color: isDarkMode ? '#98ff98' : 'green' }}>
                                    <i className="fas fa-user"></i>
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
