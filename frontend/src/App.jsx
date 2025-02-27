import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Calendar from './components/calendar/Calendar';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import MonthlyChart from './components/charts/MonthlyChart';
import About from './components/About';
import Footer from './components/Footer';
import { TimeSheetProvider } from './context/TimeSheetContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TimeSheetProvider>
          <BrowserRouter>
            <Navbar />
            <div className="py-5">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route path="/chart" element={
                  <ProtectedRoute>
                    <MonthlyChart />
                  </ProtectedRoute>
                } />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
              </Routes>
            </div>
            <Footer />
          </BrowserRouter>
        </TimeSheetProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
