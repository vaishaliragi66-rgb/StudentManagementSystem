import { useEffect, useState } from 'react';
import { achievementAPI, studentAPI } from '../services/api';
import '../styles/LeaderboardPage.css';

function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [achRes, stuRes] = await Promise.all([
          achievementAPI.getAll(),
          studentAPI.getAll()
        ]);
        const achievements = (achRes && achRes.data) || [];
        const students = (stuRes && stuRes.data) || [];

        const scores = students.map(s => {
          const total = achievements
            .filter(a => a.studentId === s.studentId)
            .reduce((sum, a) => sum + (a.score || 0), 0);
          return { student: s, total };
        });

        scores.sort((a, b) => b.total - a.total);
        if (mounted) setLeaderboard(scores.slice(0, 5));
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
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
            <li key={entry.student.id || entry.student.studentId}>
              <strong>{entry.student.firstName} {entry.student.lastName}</strong>
              <span style={{marginLeft: '8px', color: '#9b59b6'}}>{entry.total} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default LeaderboardPage;
