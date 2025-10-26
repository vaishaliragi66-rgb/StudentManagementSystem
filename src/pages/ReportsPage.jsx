import { useEffect, useState } from 'react';
import { achievementAPI, studentAPI } from '../services/api';
import '../styles/LeaderBoard.css';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};


function LeaderboardPage() {
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    problemName: '',
    platformName: 'LeetCode',
    dateAchieved: new Date().toISOString().split('T')[0],
    score: 100,
    achievementType: 'Problem Solved'
  });

  const platforms = ['LeetCode', 'HackerRank', 'CodeChef', 'Codeforces'];
  const achievementTypes = ['Problem Solved', 'Contest Win', 'Milestone', 'Badge Earned'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (students.length > 0 && achievements.length >= 0) {
      calculateLeaderboard();
    }
  }, [students, achievements, selectedPlatform]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [achievementsRes, studentsRes] = await Promise.all([
        achievementAPI.getAll(),
        studentAPI.getAll()
      ]);

      setAchievements(achievementsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please ensure JSON Server is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaderboard = () => {
    const studentScores = students.map(student => {
      const studentAchievements = achievements.filter(a => a.studentId === student.studentId);

      const platformScores = {};
      platforms.forEach(platform => {
        const platformAchievements = studentAchievements.filter(a => a.platformName === platform);
        platformScores[platform] = platformAchievements.reduce((sum, a) => sum + (a.score || 0), 0);
      });

      const filteredAchievements = selectedPlatform === 'all' 
        ? studentAchievements 
        : studentAchievements.filter(a => a.platformName === selectedPlatform);

      const totalScore = filteredAchievements.reduce((sum, a) => sum + (a.score || 0), 0);
      const problemsSolved = filteredAchievements.filter(a => a.achievementType === 'Problem Solved').length;

      return {
        student,
        totalScore,
        problemsSolved,
        achievementCount: filteredAchievements.length,
        platformScores,
        averageScore: filteredAchievements.length > 0 ? Math.round(totalScore / filteredAchievements.length) : 0
      };
    });

    const sortedLeaderboard = studentScores
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    setLeaderboard(sortedLeaderboard);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const achievementId = `ACH${String(achievements.length + 1).padStart(3, '0')}`;
      const dataToSubmit = {
        ...formData,
        achievementId,
        score: Number(formData.score)
      };

      await achievementAPI.create(dataToSubmit);
      alert('Achievement added successfully!');

      setFormData({
        studentId: '',
        problemName: '',
        platformName: 'LeetCode',
        dateAchieved: new Date().toISOString().split('T')[0],
        score: 100,
        achievementType: 'Problem Solved'
      });
      setShowForm(false);
      fetchData();
    } catch(error) {
      console.error('Error adding achievement:', error);
      alert('Error adding achievement. Please try again.');
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'LeetCode': '',
      'HackerRank': '',
      'CodeChef': '',
      'Codeforces': ''
    };
    return icons[platform] || '';
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading-container">
          <p>Loading leaderboard...</p>
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
        <div>
          <h1>Coding Leaderboard</h1>
          <p className="subtitle">Track student achievements across coding platforms</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Achievement'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary">Retry</button>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>Add New Achievement</h2>
          <form onSubmit={handleSubmit} className="form">
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

            <input
              placeholder="Problem/Achievement Name"
              value={formData.problemName}
              onChange={(e) => setFormData({...formData, problemName: e.target.value})}
              required
            />

            <select
              value={formData.platformName}
              onChange={(e) => setFormData({...formData, platformName: e.target.value})}
              required
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            <select
              value={formData.achievementType}
              onChange={(e) => setFormData({...formData, achievementType: e.target.value})}
              required
            >
              {achievementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Score"
              value={formData.score}
              onChange={(e) => setFormData({...formData, score: e.target.value})}
              required
              min="0"
              max="100"
            />

            <input
              type="date"
              value={formData.dateAchieved}
              onChange={(e) => setFormData({...formData, dateAchieved: e.target.value})}
              required
            />

            <button type="submit" className="btn-primary">Add Achievement</button>
          </form>
        </div>
      )}

      <div className="filter-section">
        <label>Filter by Platform:</label>
        <div className="platform-filters">
          <button
            className={selectedPlatform === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setSelectedPlatform('all')}
          >
            All Platforms
          </button>
          {platforms.map(platform => (
            <button
              key={platform}
              className={selectedPlatform === platform ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedPlatform(platform)}
            >
              {getPlatformIcon(platform)} {platform}
            </button>
          ))}
        </div>
      </div>

      <div className="leaderboard-table">
        <h2>Complete Leaderboard</h2>
        <div className="table-info">
          <p>Showing {leaderboard.length} student(s)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Total Score</th>
              <th>Problems Solved</th>
              <th>Avg Score</th>
              <th className="platform-col">{getPlatformIcon('LeetCode')} LeetCode</th>
              <th className="platform-col">{getPlatformIcon('HackerRank')} HackerRank</th>
              <th className="platform-col">{getPlatformIcon('CodeChef')} CodeChef</th>
              <th className="platform-col">{getPlatformIcon('Codeforces')} Codeforces</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No achievements recorded yet. Start adding achievements!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr key={entry.student.id} className={entry.rank <= 3 ? 'top-rank' : ''}>
                  <td className="rank-cell">
                    <span className="rank-badge">{getMedalEmoji(entry.rank)}</span>
                  </td>
                  <td className="student-cell">
                    <div className="student-info">
                      <div className="student-avatar-small">
                        {entry.student.firstName.charAt(0)}{entry.student.lastName.charAt(0)}
                      </div>
                      <div>
                        <strong>{entry.student.firstName} {entry.student.lastName}</strong>
                        <br />
                        <small>{entry.student.studentId}</small>
                      </div>
                    </div>
                  </td>
                  <td className="score-cell"><strong>{entry.totalScore}</strong></td>
                  <td>{entry.problemsSolved}</td>
                  <td>{entry.averageScore}</td>
                  <td className="platform-score">{entry.platformScores['LeetCode'] || 0}</td>
                  <td className="platform-score">{entry.platformScores['HackerRank'] || 0}</td>
                  <td className="platform-score">{entry.platformScores['CodeChef'] || 0}</td>
                  <td className="platform-score">{entry.platformScores['Codeforces'] || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="achievements-section">
        <h2>Recent Achievements</h2>
        <div className="achievements-grid">
          {achievements
            .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved))
            .slice(0, 10)
            .map((achievement) => {
              const student = students.find(s => s.studentId === achievement.studentId);
              return (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-header">
                    <span className="platform-badge">
                      {getPlatformIcon(achievement.platformName)} {achievement.platformName}
                    </span>
                    <span className="score-badge">{achievement.score} pts</span>
                  </div>
                  <h4>{achievement.problemName}</h4>
                  <p className="student-name">
                    {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                  </p>
                  <div className="achievement-footer">
                    <span className="achievement-type">{achievement.achievementType}</span>
                    <span className="achievement-date">
                      {new Date(achievement.dateAchieved).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
    </motion.div>
  );
}

export default LeaderboardPage;