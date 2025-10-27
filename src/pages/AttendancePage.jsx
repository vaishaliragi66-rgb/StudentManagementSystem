import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
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
    attendance_id: '',
    student_id: '',
    course_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, courseRes, attRes] = await Promise.all([
        supabase.from('student').select('*'),
        supabase.from('course').select('*'),
        supabase.from('attendance').select('*'),
      ]);

      if (stuRes.error) throw stuRes.error;
      if (courseRes.error) throw courseRes.error;
      if (attRes.error) throw attRes.error;

      setStudents(stuRes.data);
      setCourses(courseRes.data);
      setAttendance(attRes.data);
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
        attendance_id: formData.attendance_id || generateAttendanceId(),
      };

      const { error } = await supabase.from('attendance').insert([attendanceData]);
      if (error) throw error;

      setFormData({
        attendance_id: '',
        student_id: '',
        course_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
      });
      setShowForm(false);
      fetchData();
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert('Error marking attendance. Please try again.');
    }
  };

  const calculateAttendancePercentage = (student_id) => {
    const studentAttendance = attendance.filter((a) => a.student_id === student_id);
    if (studentAttendance.length === 0) return 0;
    const present = studentAttendance.filter((a) => a.status === 'Present').length;
    return Math.round((present / studentAttendance.length) * 100);
  };

  const getAttendanceCount = (student_id) => {
    const studentAttendance = attendance.filter((a) => a.student_id === student_id);
    const present = studentAttendance.filter((a) => a.status === 'Present').length;
    const total = studentAttendance.length;
    return { present, total };
  };

  if (loading) {
    return (
      <div className="attendance-page">
        <p className="loading">Loading attendance data...</p>
      </div>
    );
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
                value={formData.attendance_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, attendance_id: e.target.value })
                }
              />
              <select
                value={formData.student_id || ''}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_id} - {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>

              <select
                value={formData.course_id || ''}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <select
                value={formData.status || 'Present'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              <button type="submit" className="btn-primary">
                Record Attendance
              </button>
            </form>
          </div>
        )}

        <div className="attendance-stats">
          <h2>Attendance Summary by Student</h2>
          {students.length === 0 ? (
            <p className="no-data">No students found.</p>
          ) : (
            <div className="stats-grid">
              {students.map((student) => {
                const percentage = calculateAttendancePercentage(student.student_id);
                const { present, total } = getAttendanceCount(student.student_id);
                return (
                  <div key={student.student_id} className="stat-card">
                    <h4>
                      {student.first_name} {student.last_name}
                    </h4>
                    <div
                      className={`percentage ${
                        percentage >= 75
                          ? 'good'
                          : percentage >= 50
                          ? 'average'
                          : 'poor'
                      }`}
                    >
                      {percentage}%
                    </div>
                    <p className="attendance-count">
                      {present}/{total} classes attended
                    </p>
                    <small>{student.student_id}</small>
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
                  {attendance
                    .slice()
                    .reverse()
                    .map((record) => {
                      const student = students.find(
                        (s) => s.student_id === record.student_id
                      );
                      const course = courses.find(
                        (c) => c.course_id === record.course_id
                      );
                      return (
                        <tr key={record.attendance_id}>
                          <td>{record.attendance_id}</td>
                          <td>
                            {student
                              ? `${student.first_name} ${student.last_name}`
                              : 'Unknown'}
                          </td>
                          <td>{course ? course.course_name : 'Unknown'}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td
                            className={
                              record.status === 'Present' ? 'present' : 'absent'
                            }
                          >
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
