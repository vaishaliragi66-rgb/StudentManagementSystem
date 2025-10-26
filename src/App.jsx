import { Routes, Route,useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';
import { AnimatePresence } from 'framer-motion';
//import { Routes, Route, useLocation } from 'react-router-dom';



function App() {
  return (
    <div>
      <Navigation />
      <main className="main-content">
        <div className="app-container">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;