import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

function Home() {
    const { isDarkMode } = useTheme();

    return (
        <div className={`container ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            <div className="text-center py-5">
                <h1 className="display-4">Welcome to Task Trail</h1>
                <p className="lead">Your ultimate tool for tracking work hours effortlessly.</p>
                <button className="btn btn-success btn-lg mt-3 shadow">
                    <Link to="/signup" className="text-white text-decoration-none">Get Started</Link>
                </button>
            </div>

            <section className="my-5">
                <h2>About Task Trail</h2>
                <p>Task Trail is a web application designed to help you track your work hours efficiently. Because time is money!</p>
            </section>

            <section className="my-5">
                <h2>Key Features</h2>
                <ul>
                    <li ><strong>Task Management:</strong> Add, view, and edit daily tasks with ease.</li>
                    <li ><strong>Total Hours Summary:</strong> Automatically calculates the total hours worked per day and shows a breakdown of tasks.</li>
                    <li ><strong>Exportable Reports:</strong> Export your tracked time and tasks into a CSV file for easy sharing and record-keeping.</li>
                </ul>
            </section>

            <section className="my-5">
                <h2>Why Choose Task Trail?</h2>
                <p>Whether you're a freelancer, project manager, or anyone who values their time, Task Trail provides the tools you need to create client-ready reports and manage your time effectively.</p>
            </section>

            <section className="my-5">
                <h2>Development Insights</h2>
                <p>This project was developed using ReactJS, focusing on creating a responsive and user-friendly interface. The app leverages modern web development practices and tools to ensure a smooth user experience.</p>
            </section>

            <footer className="text-center py-4">

                <p>Powered by ReactJS and Express.   <Link to="/about" className="text-success">Learn more</Link></p>
            </footer>
        </div>
    );
}

export default Home;