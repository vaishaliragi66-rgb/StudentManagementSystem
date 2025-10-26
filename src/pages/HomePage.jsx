import { useEffect, useState, useRef } from 'react';
import { studentAPI, courseAPI, attendanceAPI, examAPI, resultAPI } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import LeaderboardPage from './LeaderboardPage';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255,255,255,0.4)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      <div className="spotlight-overlay"></div>
      {children}
    </div>
  );
};


function HomePage() {
  const [stats, setStats] = useState({ 
    students: 0, 
    courses: 0, 
    attendance: 0,
    exams: 0,
    results: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [s, c, a, e, r] = await Promise.all([
        studentAPI.getAll(),
        courseAPI.getAll(),
        attendanceAPI.getAll(),
        examAPI.getAll(),
        resultAPI.getAll()
      ]);
      
      setStats({ 
        students: s.data.length, 
        courses: c.data.length, 
        attendance: a.data.length,
        exams: e.data.length,
        results: r.data.length
      });
      
      // Get last 3 students
      setRecentStudents(s.data.slice(-3).reverse());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="hero">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

return (
     <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
      >
  <div className="home-page">
    <div className="hero">
      <h1>Student Management System</h1>
      <p>Manage students, attendance, and academic performance efficiently</p>
    </div>

    <div className="content-container">
      <div className="stats-grid">
        <SpotlightCard className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">{stats.students}</p>
        </SpotlightCard>
        <SpotlightCard className="stat-card">
          <h3>Total Courses</h3>
          <p className="stat-number">{stats.courses}</p>
        </SpotlightCard>
        <SpotlightCard className="stat-card">
          <h3>Attendance Records</h3>
          <p className="stat-number">{stats.attendance}</p>
        </SpotlightCard>
        <SpotlightCard className="stat-card">
          <h3>Exams</h3>
          <p className="stat-number">{stats.exams}</p>
        </SpotlightCard>
        <SpotlightCard className="stat-card">
          <h3>Results</h3>
          <p className="stat-number">{stats.results}</p>
        </SpotlightCard>
      </div>

      <div className="recent-section">
        <h2>Recently Added Students</h2>
        <div className="recent-students">
          {recentStudents.map((s) => (
            <div className="recent-student-card" key={s.id || s.studentId || s._id}>
              <h4>{s.firstName} {s.lastName}</h4>
              <p>{s.department || ''} {s.classSection ? `· ${s.classSection}` : ''}</p>
              <small style={{color: '#999'}}>{s.studentId || s.id || ''}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard embedded on homepage */}
      <div className="home-leaderboard">
        <LeaderboardPage />
      </div>

      <div className="view-more">
      <Link to="/students">View All Students →</Link>
    </div>
    </div>
  </div>
    </motion.div>
);
}
export default HomePage;