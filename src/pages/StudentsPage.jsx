import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
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
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    class_section: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student')
        .select('*');
      if (error) throw error;
      setStudents(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      department: '',
      class_section: ''
    });
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const { error } = await supabase
          .from('student')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            department: formData.department,
            class_section: formData.class_section
          })
          .eq('student_id', editId);
        if (error) throw error;
        alert('Student updated successfully!');
      } else {
        const { error } = await supabase
          .from('student')
          .insert([{
            student_id: formData.student_id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            department: formData.department,
            class_section: formData.class_section
          }]);
        if (error) throw error;
        alert('Student added successfully!');
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      alert('Error saving student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email || '',
      phone_number: student.phone_number || '',
      department: student.department || '',
      class_section: student.class_section || ''
    });
    setEditMode(true);
    setEditId(student.student_id);
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const { error } = await supabase
          .from('student')
          .delete()
          .eq('student_id', studentId);
        if (error) throw error;
        alert('Student deleted successfully!');
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
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
        <h1>Students</h1>
        <button onClick={() => setShowForm(true)}>Add Student</button>

        {showForm && (
          <form className="student-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Student ID" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
            <input type="text" placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
            <input type="text" placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="text" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            <input type="text" placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            <input type="text" placeholder="Class Section" value={formData.class_section} onChange={e => setFormData({...formData, class_section: e.target.value})} />
            <button type="submit">{editMode ? 'Update' : 'Add'}</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </form>
        )}

        <div className="students-list">
          {students.map(student => (
            <div key={student.student_id} className="student-card">
              <h3>{student.first_name} {student.last_name}</h3>
              <p>ID: {student.student_id}</p>
              <p>Email: {student.email || '-'}</p>
              <p>Phone: {student.phone_number || '-'}</p>
              <p>Dept: {student.department || '-'}</p>
              <p>Class: {student.class_section || '-'}</p>
              <button onClick={() => handleEdit(student)}>Edit</button>
              <button onClick={() => handleDelete(student.student_id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default StudentsPage;
