import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import '../styles/ExamsPage.css';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('exams');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    exam_id: '',
    exam_name: '',
    exam_date: '',
    exam_type: 'Written',
    total_marks: 100,
    course_id: ''
  });

  const [resultForm, setResultForm] = useState({
    result_id: '',
    student_id: '',
    exam_id: '',
    marks_obtained: 0,
    grade: 'A'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [examRes, resultRes, courseRes, studentRes] = await Promise.all([
        supabase.from('exam').select('*'),
        supabase.from('exam_results').select('*'),
        supabase.from('course').select('*'),
        supabase.from('student').select('*')
      ]);

      if (examRes.error) throw examRes.error;
      if (resultRes.error) throw resultRes.error;
      if (courseRes.error) throw courseRes.error;
      if (studentRes.error) throw studentRes.error;

      setExams(examRes.data);
      setResults(resultRes.data);
      setCourses(courseRes.data);
      setStudents(studentRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateExamId = () => `EX${String(exams.length + 1).padStart(3, '0')}`;
  const generateResultId = () => `R${String(results.length + 1).padStart(3, '0')}`;

  const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const examData = { ...formData, exam_id: formData.exam_id || generateExamId() };
      const { error } = await supabase.from('exam').insert([examData]);
      if (error) throw error;

      setFormData({
        exam_id: '',
        exam_name: '',
        exam_date: '',
        exam_type: 'Written',
        total_marks: 100,
        course_id: ''
      });
      setShowForm(false);
      fetchData();
      alert('Exam created successfully!');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Error creating exam. Please try again.');
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      const exam = exams.find(ex => ex.exam_id === resultForm.exam_id);
      const totalMarks = exam ? exam.total_marks : 100;
      const grade = calculateGrade(resultForm.marks_obtained, totalMarks);

      const resultData = { ...resultForm, result_id: resultForm.result_id || generateResultId(), grade };
      const { error } = await supabase.from('exam_results').insert([resultData]);
      if (error) throw error;

      setResultForm({ result_id: '', student_id: '', exam_id: '', marks_obtained: 0, grade: 'A' });
      fetchData();
      alert('Result added successfully!');
    } catch (error) {
      console.error('Error adding result:', error);
      alert('Error adding result. Please try again.');
    }
  };

  if (loading) return <div className="exams-page"><p className="loading">Loading exams data...</p></div>;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="exams-page">
        <div className="page-header"><h1>Exams Management</h1></div>

        <div className="tabs">
          <button className={activeTab === 'exams' ? 'tab active' : 'tab'} onClick={() => { setActiveTab('exams'); setShowForm(false); }}>Exams ({exams.length})</button>
          <button className={activeTab === 'results' ? 'tab active' : 'tab'} onClick={() => { setActiveTab('results'); setShowForm(false); }}>Results ({results.length})</button>
        </div>

        {activeTab === 'exams' && (
          <div className="exams-section">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ marginBottom: '20px' }}>
              {showForm ? 'Cancel' : '+ Add Exam'}
            </button>

            {showForm && (
              <div className="form-container">
                <h3>Create New Exam</h3>
                <form onSubmit={handleExamSubmit} className="form">
                  <input placeholder="Exam ID (auto-generated if empty)" value={formData.exam_id} onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })} />
                  <input placeholder="Exam Name" value={formData.exam_name} onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })} required />
                  <input type="date" value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} required />
                  <select value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}>
                    <option value="Written">Written</option>
                    <option value="Online">Online</option>
                    <option value="Practical">Practical</option>
                    <option value="Viva">Viva</option>
                  </select>
                  <input type="number" placeholder="Total Marks" value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })} required min="1" />
                  <select value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_code} - {c.course_name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-primary">Create Exam</button>
                </form>
              </div>
            )}

            <div className="exams-list">
              {exams.length === 0 ? <p className="no-data">No exams found. Create your first exam!</p> : exams.map(exam => {
                const course = courses.find(c => c.course_id === exam.course_id);
                const examResults = results.filter(r => r.exam_id === exam.exam_id);
                return (
                  <div key={exam.exam_id} className="exam-card">
                    <div className="exam-header">
                      <h3>{exam.exam_name}</h3>
                      <span className="exam-type">{exam.exam_type}</span>
                    </div>
                    <div className="exam-details">
                      <p><strong>Course:</strong> {course ? `${course.course_code} - ${course.course_name}` : 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(exam.exam_date).toLocaleDateString()}</p>
                      <p><strong>Total Marks:</strong> {exam.total_marks}</p>
                      <p><strong>Results Submitted:</strong> {examResults.length}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-section">
            <div className="form-container">
              <h3>Add Exam Result</h3>
              <form onSubmit={handleResultSubmit} className="form">
                <input placeholder="Result ID (auto-generated if empty)" value={resultForm.result_id} onChange={(e) => setResultForm({ ...resultForm, result_id: e.target.value })} />
                <select value={resultForm.student_id} onChange={(e) => setResultForm({ ...resultForm, student_id: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_id} - {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
                <select value={resultForm.exam_id} onChange={(e) => setResultForm({ ...resultForm, exam_id: e.target.value })} required>
                  <option value="">Select Exam</option>
                  {exams.map(e => (
                    <option key={e.exam_id} value={e.exam_id}>
                      {e.exam_name}
                    </option>
                  ))}
                </select>
                <input type="number" placeholder="Marks Obtained" value={resultForm.marks_obtained} onChange={(e) => setResultForm({ ...resultForm, marks_obtained: e.target.value })} required min="0" />
                <div className="grade-info"><small>Grade will be auto-calculated based on marks</small></div>
                <button type="submit" className="btn-primary">Add Result</button>
              </form>
            </div>

            <div className="results-table">
              {results.length === 0 ? <p className="no-data">No results found. Add exam results above!</p> : (
                <table>
                  <thead>
                    <tr>
                      <th>Result ID</th>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => {
                      const student = students.find(s => s.student_id === result.student_id);
                      const exam = exams.find(e => e.exam_id === result.exam_id);
                      const percentage = exam ? ((result.marks_obtained / exam.total_marks) * 100).toFixed(2) : 0;
                      return (
                        <tr key={result.result_id}>
                          <td>{result.result_id}</td>
                          <td>{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                          <td>{exam ? exam.exam_name : 'Unknown'}</td>
                          <td>{result.marks_obtained}</td>
                          <td>{exam ? exam.total_marks : 'N/A'}</td>
                          <td>{percentage}%</td>
                          <td className={`grade grade-${result.grade.replace('+', 'plus')}`}>{result.grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ExamsPage;
