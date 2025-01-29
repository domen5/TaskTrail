import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

function Home() {
    const { isDarkMode } = useTheme();

    return (
        <div className={`container-md pt-5 text-center ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            <div className="text-center py-3">
                <h1 className="display-3 fw-bold mb-4"><i className="fas fa-chart-line me-2"></i>Welcome to Task Trail</h1>
                <p className="lead mb-4">Effortlessly track your work hours and boost productivity.</p>
                <button className="btn btn-success btn-lg mt-3 shadow">
                    <Link to="/signup" className={`text-decoration-none ${isDarkMode ? 'text-white' : 'text-dark'}`}>Get Started</Link>
                </button>
            </div>

            <section className="my-5">
                <h2 className="h4 mb-3"><i className="fas fa-info-circle me-2"></i>About Task Trail</h2>
                <p className="mb-4">
                    Task Trail is your go-to web application for efficient work hour tracking. Whether you're a freelancer, project manager, or anyone who values their time, Task Trail provides the tools you need to create client-ready reports and manage your time effectively.
                </p>
            </section>

            <section className="my-5">
                <h2 className="h4 mb-3"><i className="fas fa-tasks me-2"></i>Key Features</h2>
                <ul className="list-unstyled">
                    <li className="mb-2"><strong>Task Management:</strong> Add, view, and edit daily tasks with ease.</li>
                    <li className="mb-2"><strong>Total Hours Summary:</strong> Automatically calculates the total hours worked per day and shows a breakdown of tasks.</li>
                    <li className="mb-2"><strong>Exportable Reports:</strong> Export your tracked time and tasks into a CSV file for easy sharing and record-keeping.</li>
                </ul>
            </section>

            <section className="mt-5 mb-0 pb-0">
                <h2 className="h4 mb-3"><i className="fas fa-lightbulb me-2"></i>Development Insights</h2>
                <p className="">This application was built using ReactJS for the frontend and NodeJS/Express for the backend. It uses MongoDB as the database and Mongoose as the ODM. The application is containerized and deployed using Docker.</p>
                <p>Click here to  <Link to="/about" className="text-success">Learn more</Link></p>
            </section>
        </div>
    );
}

export default Home;