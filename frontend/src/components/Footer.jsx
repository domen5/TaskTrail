import { Link } from 'react-router-dom';

const GITHUB_URL = window.ENV?.GITHUB_URL || import.meta.env.VITE_GITHUB_URL || 'https://github.com/username';
const REPOSITORY_URL = window.ENV?.REPOSITORY_URL || import.meta.env.VITE_REPOSITORY_URL || 'https://github.com/username/repository';
const LINKEDIN_URL = window.ENV?.LINKEDIN_URL || import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com/in/username';

const Footer = () => {
    return (
        <footer className="text-center">
            <p>Powered by ReactJS and Express.   <Link to="/about" className="text-success">Learn more</Link></p>
            <div>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-dark me-3">
                    <i className="fab fa-github fa-lg"></i>
                </a>
                <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="text-dark me-3">
                    <i className="fas fa-code-branch fa-lg"></i>
                </a>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-dark">
                    <i className="fab fa-linkedin fa-lg"></i>
                </a>
            </div>
        </footer>
    );
}

export default Footer;