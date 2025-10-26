import { useEffect, useState } from 'react';
import { attendanceAPI, studentAPI, courseAPI } from '../services/api';
import '../styles/AttendancePage.css';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};


function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    attendanceId: '',
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [a, s, c] = await Promise.all([
        attendanceAPI.getAll(),
        studentAPI.getAll(),
        courseAPI.getAll()
      ]);
      setAttendance(a.data);
      setStudents(s.data);
      setCourses(c.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceId = () => {
    const count = attendance.length + 1;
    return `A${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const attendanceData = {
        ...formData,
        attendanceId: formData.attendanceId || generateAttendanceId()
      };
      await attendanceAPI.create(attendanceData);
      setFormData({
        attendanceId: '',
        studentId: '',
        courseId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
      setShowForm(false);
      fetchData();
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert('Error marking attendance. Please try again.');
    }
  };

  const calculateAttendancePercentage = (studentId) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    if (studentAttendance.length === 0) return 0;
    const present = studentAttendance.filter(a => a.status === 'Present').length;
    return Math.round((present / studentAttendance.length) * 100);
  };

  const getAttendanceCount = (studentId) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    const present = studentAttendance.filter(a => a.status === 'Present').length;
    const total = studentAttendance.length;
    return { present, total };
  };

  if (loading) {
    return <div className="attendance-page"><p className="loading">Loading attendance data...</p></div>;
  }

  return (
    
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >

    <div className="attendance-page">
      <div className="page-header">
  <h1>Attendance Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Mark Attendance'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Mark Attendance</h3>
          <form onSubmit={handleSubmit} className="form">
            <input
              placeholder="Attendance ID (auto-generated if empty)"
              value={formData.attendanceId}
              onChange={(e) => setFormData({...formData, attendanceId: e.target.value})}
            />
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              required
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.studentId}>
                  {s.studentId} - {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              required
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.courseId}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            <button type="submit" className="btn-primary">Record Attendance</button>
          </form>
        </div>
      )}

      <div className="attendance-stats">
        <h2>Attendance Summary by Student</h2>
        {students.length === 0 ? (
          <p className="no-data">No students found.</p>
        ) : (
          <div className="stats-grid">
            {students.map(student => {
              const percentage = calculateAttendancePercentage(student.studentId);
              const { present, total } = getAttendanceCount(student.studentId);
              return (
                <div key={student.id} className="stat-card">
                  <h4>{student.firstName} {student.lastName}</h4>
                  <div className={`percentage ${percentage >= 75 ? 'good' : percentage >= 50 ? 'average' : 'poor'}`}>
                    {percentage}%
                  </div>
                  <p className="attendance-count">{present}/{total} classes attended</p>
                  <small>{student.studentId}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="attendance-table">
        <h2>Recent Attendance Records</h2>
        {attendance.length === 0 ? (
          <p className="no-data">No attendance records found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
            <thead>
              <tr>
                <th>Attendance ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice().reverse().map((record) => {
                const student = students.find(s => s.studentId === record.studentId);
                const course = courses.find(c => c.courseId === record.courseId);
                return (
                  <tr key={record.id}>
                    <td>{record.attendanceId}</td>
                    <td>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
                    <td>{course ? course.courseName : 'Unknown'}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td className={record.status === 'Present' ? 'present' : 'absent'}>
                      {record.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
    </motion.div>
  );
}
export default AttendancePage;