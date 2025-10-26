import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import '../styles/StudentsPage.css';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};


function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    classSection: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      setStudents(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      department: '',
      classSection: ''
    });
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await studentAPI.update(editId, formData);
        alert('Student updated successfully!');
      } else {
        await studentAPI.create(formData);
        alert('Student added successfully!');
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phoneNumber: student.phoneNumber || '',
      department: student.department || '',
      classSection: student.classSection || ''
    });
    setEditMode(true);
    setEditId(student.studentId);
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(studentId);
        alert('Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="students-page"><p className="loading">Loading students...</p></div>;
  }

  return (
     <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >

    <div className="students-page">
      <div className="page-header">
  <h1>Students Management</h1>
        <button 
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }} 
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-container">
          <h3>{editMode ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <input
              placeholder="Student ID (e.g., S004)"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              required
              disabled={editMode}
            />
            <input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
            <input
              placeholder="Department (e.g., Computer Science)"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
            <input
              placeholder="Class Section (e.g., A, B)"
              value={formData.classSection}
              onChange={(e) => setFormData({...formData, classSection: e.target.value})}
            />
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editMode ? 'Update Student' : 'Add Student'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="students-table">
        {students.length === 0 ? (
          <p className="no-data">No students found. Add your first student!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.phoneNumber || 'N/A'}</td>
                  <td>{student.department || 'N/A'}</td>
                  <td>{student.classSection || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(student.studentId)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </motion.div>
  );
}
export default StudentsPage;