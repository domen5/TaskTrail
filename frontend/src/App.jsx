import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Calendar from './components/Calendar';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import About from './components/About';
import { TimeSheetProvider } from './context/TimeSheetContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <TimeSheetProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </TimeSheetProvider>
  );
}

export default App;
