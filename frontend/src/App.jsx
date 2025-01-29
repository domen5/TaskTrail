import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Calendar from './components/calendar/Calendar';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import About from './components/About';
import Footer from './components/Footer';
import { TimeSheetProvider } from './context/TimeSheetContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <TimeSheetProvider>
        <BrowserRouter>
          <Navbar />
          <div className="py-5">
            <Routes>
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </TimeSheetProvider>
    </ThemeProvider>
  );
}

export default App;
