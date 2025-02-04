import { useTheme } from '../context/ThemeContext';

const About = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`container-md pt-3 text-center ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            <div className="text-center">
                <h1 className="display-3 fw-bold"><i className="fas fa-chart-line me-2"></i>About Task Trail</h1>
                <p className="lead">Learn more about the development of Task Trail.</p>
            </div>

            <section className="mt-5">
                <h2 className="h4 mb-3"><i className="fas fa-layer-group me-2"></i>Frontend Architecture</h2>
                <div className="mb-4">
                    <p>Built with ReactJS for optimal performance and component reusability. Features include:</p>
                    <p>
                        A Custom built Calendar component<br />
                        Custom theme implementation using Context API for seamless dark/light mode switching<br />
                        Responsive design using Bootstrap 5<br />
                        
                    </p>
                </div>
            </section>

            <section className="mt-5">
                <h2 className="h4 mb-3"><i className="fas fa-server me-2"></i>Backend Infrastructure</h2>
                <div className="mb-4">
                    <p>Powered by a robust Node.js/Express stack:</p>
                    <p>
                        RESTful API architecture enabling horizontal scaling<br />
                        Comprehensive testing suite using Chai and Mocha<br />
                        MongoDB with Mongoose ODM for flexible data modeling
                    </p>
                </div>
            </section>

            <section className="mt-5">
                <h2 className="h4 mb-3"><i className="fas fa-cogs me-2"></i>DevOps & Deployment</h2>
                <div>
                    <p>Containerized with Docker for consistent environments:</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.<br />
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos<br />
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa<br />
                    </p>
                </div>
            </section>
        </div>
    );
};

export default About;