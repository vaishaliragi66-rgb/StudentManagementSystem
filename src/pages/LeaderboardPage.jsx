import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import '../styles/LeaderboardPage.css';

function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadLeaderboard = async () => {
      try {
        // Fetch students
        const { data: students, error: stuError } = await supabase
          .from('student')
          .select('*');
        if (stuError) throw stuError;

        // Fetch coding achievements
        const { data: achievements, error: achError } = await supabase
          .from('coding_achievements')
          .select('*');
        if (achError) throw achError;

        // Calculate total scores
        const scores = students.map(student => {
          const studentAchievements = achievements
            .filter(a => a.student_id === student.student_id);
          
          const total = studentAchievements.reduce((sum, a) => 
            sum + (Number(a.codeforces_solved || 0) + Number(a.leetcode_solved || 0)), 0);
          
          return { 
            student, 
            total,
            codeforcesProblems: studentAchievements
              .reduce((sum, a) => sum + Number(a.codeforces_solved || 0), 0),
            leetcodeProblems: studentAchievements
              .reduce((sum, a) => sum + Number(a.leetcode_solved || 0), 0)
          };
        });

        // Sort descending
        scores.sort((a, b) => b.total - a.total);

        if (mounted) setLeaderboard(scores.slice(0, 5));
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLeaderboard();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="leaderboard-mini">Loading leaderboard…</div>;

  return (
    <div className="leaderboard-mini">
      <h3>Top Students</h3>
      {leaderboard.length === 0 ? (
        <p className="muted">No achievements yet.</p>
      ) : (
        <ol>
          {leaderboard.map(entry => (
            <li key={entry.student.student_id}>
              <div className="student-name">
                <strong>{entry.student.first_name} {entry.student.last_name}</strong>
                <small>{entry.student.student_id}</small>
              </div>
              <div className="student-score">
                <span className="total-problems">{entry.total} problems</span>
                <div className="platform-breakdown">
                  <small>CF: {entry.codeforcesProblems}</small>
                  <small>LC: {entry.leetcodeProblems}</small>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default LeaderboardPage;
