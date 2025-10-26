import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import LeaderboardPage from './LeaderboardPage';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// SpotlightCard: simplified, no internal key cloning
const SpotlightCard = React.memo(({ children, className = '', spotlightColor = 'rgba(255,255,255,0.4)' }) => {
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
      <div className="spotlight-overlay" />
      {children}
    </div>
  );
});

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
      const [studentsRes, coursesRes, attendanceRes, examsRes, resultsRes] = await Promise.all([
        supabase.from('student').select('*'),
        supabase.from('course').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('exam').select('*'),
        supabase.from('exam_results').select('*')
      ]);
      
      if (studentsRes.error) throw studentsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;
      if (examsRes.error) throw examsRes.error;
      if (resultsRes.error) throw resultsRes.error;
      
      setStats({ 
        students: studentsRes.data.length, 
        courses: coursesRes.data.length, 
        attendance: attendanceRes.data.length,
        exams: examsRes.data.length,
        results: resultsRes.data.length
      });
      
      // Last 3 students
      const recentStuds = studentsRes.data.slice(-3).reverse();
      setRecentStudents(recentStuds);
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
            {[
              { key: 'students', title: 'Total Students', value: stats.students },
              { key: 'courses', title: 'Total Courses', value: stats.courses },
              { key: 'attendance', title: 'Attendance Records', value: stats.attendance },
              { key: 'exams', title: 'Exams', value: stats.exams },
              { key: 'results', title: 'Results', value: stats.results }
            ].map(stat => (
              <SpotlightCard key={stat.key} className="stat-card">
                <h3>{stat.title}</h3>
                <p className="stat-number">{stat.value}</p>
              </SpotlightCard>
            ))}
          </div>

          <div className="recent-section">
            <h2>Recently Added Students</h2>
            <div className="recent-students">
              {recentStudents.map(s => (
                <div className="recent-student-card" key={s.student_id || s.id || s._id}>
                  <h4>{s.first_name} {s.last_name}</h4>
                  <p>{s.department || ''} {s.class_section ? `· ${s.class_section}` : ''}</p>
                  <small style={{ color: '#999' }}>{s.student_id || s.id || ''}</small>
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
