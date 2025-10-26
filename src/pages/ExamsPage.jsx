import { useEffect, useState } from 'react';
import { examAPI, resultAPI, courseAPI, studentAPI } from '../services/api';
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
    examId: '',
    examName: '',
    examDate: '',
    examType: 'Written',
    totalMarks: 100,
    courseId: ''
  });
  const [resultForm, setResultForm] = useState({
    resultId: '',
    studentId: '',
    examId: '',
    marksObtained: 0,
    grade: 'A'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [e, r, c, s] = await Promise.all([
        examAPI.getAll(),
        resultAPI.getAll(),
        courseAPI.getAll(),
        studentAPI.getAll()
      ]);
      setExams(e.data);
      setResults(r.data);
      setCourses(c.data);
      setStudents(s.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateExamId = () => {
    const count = exams.length + 1;
    return `EX${String(count).padStart(3, '0')}`;
  };

  const generateResultId = () => {
    const count = results.length + 1;
    return `R${String(count).padStart(3, '0')}`;
  };

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
      const examData = {
        ...formData,
        examId: formData.examId || generateExamId()
      };
      await examAPI.create(examData);
      setFormData({
        examId: '',
        examName: '',
        examDate: '',
        examType: 'Written',
        totalMarks: 100,
        courseId: ''
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
      const exam = exams.find(ex => ex.examId === resultForm.examId);
      const totalMarks = exam ? exam.totalMarks : 100;
      const calculatedGrade = calculateGrade(resultForm.marksObtained, totalMarks);
      
      const resultData = {
        ...resultForm,
        resultId: resultForm.resultId || generateResultId(),
        grade: calculatedGrade
      };
      await resultAPI.create(resultData);
      setResultForm({
        resultId: '',
        studentId: '',
        examId: '',
        marksObtained: 0,
        grade: 'A'
      });
      fetchData();
      alert('Result added successfully!');
    } catch (error) {
      console.error('Error adding result:', error);
      alert('Error adding result. Please try again.');
    }
  };

  if (loading) {
    return <div className="exams-page"><p className="loading">Loading exams data...</p></div>;
  }

  return (
       <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
    <div className="exams-page">
      <div className="page-header">
        <h1>Exams Management</h1>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'exams' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('exams');
            setShowForm(false);
          }}
        >
          Exams ({exams.length})
        </button>
        <button 
          className={activeTab === 'results' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('results');
            setShowForm(false);
          }}
        >
           Results ({results.length})
        </button>
      </div>

      {activeTab === 'exams' && (
        <div className="exams-section">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn-primary"
            style={{ marginBottom: '20px' }}
          >
            {showForm ? 'Cancel' : '+ Add Exam'}
          </button>

          {showForm && (
            <div className="form-container">
              <h3>Create New Exam</h3>
              <form onSubmit={handleExamSubmit} className="form">
                <input
                  placeholder="Exam ID (auto-generated if empty)"
                  value={formData.examId}
                  onChange={(e) => setFormData({...formData, examId: e.target.value})}
                />
                <input
                  placeholder="Exam Name"
                  value={formData.examName}
                  onChange={(e) => setFormData({...formData, examName: e.target.value})}
                  required
                />
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                  required
                />
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                >
                  <option value="Written">Written</option>
                  <option value="Online">Online</option>
                  <option value="Practical">Practical</option>
                  <option value="Viva">Viva</option>
                </select>
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                  required
                  min="1"
                />
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
                <button type="submit" className="btn-primary">Create Exam</button>
              </form>
            </div>
          )}

          <div className="exams-list">
            {exams.length === 0 ? (
              <p className="no-data">No exams found. Create your first exam!</p>
            ) : (
              exams.map(exam => {
                const course = courses.find(c => c.courseId === exam.courseId);
                const examResults = results.filter(r => r.examId === exam.examId);
                return (
                  <div key={exam.id} className="exam-card">
                    <div className="exam-header">
                      <h3>{exam.examName}</h3>
                      <span className="exam-type">{exam.examType}</span>
                    </div>
                    <div className="exam-details">
                      <p><strong>Course:</strong> {course ? `${course.courseCode} - ${course.courseName}` : 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(exam.examDate).toLocaleDateString()}</p>
                      <p><strong>Total Marks:</strong> {exam.totalMarks}</p>
                      <p><strong>Results Submitted:</strong> {examResults.length}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="results-section">
          <div className="form-container">
            <h3>Add Exam Result</h3>
            <form onSubmit={handleResultSubmit} className="form">
              <input
                placeholder="Result ID (auto-generated if empty)"
                value={resultForm.resultId}
                onChange={(e) => setResultForm({...resultForm, resultId: e.target.value})}
              />
              <select
                value={resultForm.studentId}
                onChange={(e) => setResultForm({...resultForm, studentId: e.target.value})}
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
                value={resultForm.examId}
                onChange={(e) => setResultForm({...resultForm, examId: e.target.value})}
                required
              >
                <option value="">Select Exam</option>
                {exams.map(e => (
                  <option key={e.id} value={e.examId}>
                    {e.examName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Marks Obtained"
                value={resultForm.marksObtained}
                onChange={(e) => setResultForm({...resultForm, marksObtained: e.target.value})}
                required
                min="0"
              />
              <div className="grade-info">
                <small>Grade will be auto-calculated based on marks</small>
              </div>
              <button type="submit" className="btn-primary">Add Result</button>
            </form>
          </div>

          <div className="results-table">
            {results.length === 0 ? (
              <p className="no-data">No results found. Add exam results above!</p>
            ) : (
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
                  {results.map((result) => {
                    const student = students.find(s => s.studentId === result.studentId);
                    const exam = exams.find(e => e.examId === result.examId);
                    const percentage = exam ? ((result.marksObtained / exam.totalMarks) * 100).toFixed(2) : 0;
                    return (
                      <tr key={result.id}>
                        <td>{result.resultId}</td>
                        <td>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
                        <td>{exam ? exam.examName : 'Unknown'}</td>
                        <td>{result.marksObtained}</td>
                        <td>{exam ? exam.totalMarks : 'N/A'}</td>
                        <td>{percentage}%</td>
                        <td className={`grade grade-${result.grade.replace('+', 'plus')}`}>
                          {result.grade}
                        </td>
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