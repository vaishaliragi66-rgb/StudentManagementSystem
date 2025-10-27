import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import '../styles/ReportsPage.css';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function ReportsPage() {
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    codeforces_handle: '',
    leetcode_handle: '',
    codeforces_solved: 0,
    leetcode_solved: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [achievementsRes, studentsRes] = await Promise.all([
        supabase.from('coding_achievements').select('*'),
        supabase.from('student').select('*')
      ]);

      if (achievementsRes.error) throw achievementsRes.error;
      if (studentsRes.error) throw studentsRes.error;

      setAchievements(achievementsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        codeforces_solved: Number(formData.codeforces_solved),
        leetcode_solved: Number(formData.leetcode_solved)
      };

      const { error } = await supabase.from('coding_achievements').insert([dataToSubmit]);
      if (error) throw error;

      alert('Coding achievements added successfully!');
      setFormData({
        student_id: '',
        codeforces_handle: '',
        leetcode_handle: '',
        codeforces_solved: 0,
        leetcode_solved: 0,
        notes: ''
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Error adding achievement:', err);
      alert('Error adding achievement. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading-container">
          <p>Loading coding achievements...</p>
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
      <div className="leaderboard-page">
        <div className="page-header">
          <h1>Coding Achievements</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Achievement'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="form-container">
            <h3>Add Coding Achievement</h3>
            <form onSubmit={handleSubmit} className="form">
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_id} - {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>

              <div className="form-row">
                <div className="form-group">
                  <label>Codeforces Handle</label>
                  <input
                    type="text"
                    value={formData.codeforces_handle}
                    onChange={(e) => setFormData({ ...formData, codeforces_handle: e.target.value })}
                    placeholder="Codeforces Handle"
                  />
                </div>
                <div className="form-group">
                  <label>Problems Solved (Codeforces)</label>
                  <input
                    type="number"
                    value={formData.codeforces_solved}
                    onChange={(e) => setFormData({ ...formData, codeforces_solved: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>LeetCode Handle</label>
                  <input
                    type="text"
                    value={formData.leetcode_handle}
                    onChange={(e) => setFormData({ ...formData, leetcode_handle: e.target.value })}
                    placeholder="LeetCode Handle"
                  />
                </div>
                <div className="form-group">
                  <label>Problems Solved (LeetCode)</label>
                  <input
                    type="number"
                    value={formData.leetcode_solved}
                    onChange={(e) => setFormData({ ...formData, leetcode_solved: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-primary">Save Achievement</button>
            </form>
          </div>
        )}

        <div className="achievements-list">
          <h2>Student Achievements</h2>
          {achievements.length === 0 ? (
            <p className="no-data">No coding achievements recorded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Codeforces</th>
                    <th>LeetCode</th>
                    <th>Total Problems</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => {
                    const student = students.find(s => s.student_id === achievement.student_id);
                    const totalProblems = Number(achievement.codeforces_solved || 0) + Number(achievement.leetcode_solved || 0);
                    
                    return (
                      <tr key={`${achievement.student_id}`}>
                        <td>
                          {student ? `${student.first_name} ${student.last_name}` : 'Unknown'}
                          <br />
                          <small>{achievement.student_id}</small>
                        </td>
                        <td>
                          {achievement.codeforces_handle && (
                            <>
                              {achievement.codeforces_handle}
                              <br />
                              <strong>{achievement.codeforces_solved} solved</strong>
                            </>
                          )}
                        </td>
                        <td>
                          {achievement.leetcode_handle && (
                            <>
                              {achievement.leetcode_handle}
                              <br />
                              <strong>{achievement.leetcode_solved} solved</strong>
                            </>
                          )}
                        </td>
                        <td><strong>{totalProblems}</strong></td>
                        <td>{achievement.notes}</td>
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

export default ReportsPage;
