import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Flame } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Leaderboard.css';



function Leaderboard() {
  const [activeTab, setActiveTab] = useState('departments');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snap = await getDocs(collection(db, 'leaderboard'));
      const data = snap.docs.map(doc => doc.data());
      // Sort by points descending and add rank
      data.sort((a, b) => b.points - a.points);
      const rankedData = data.map((item, idx) => ({...item, rank: idx + 1}));
      setLeaderboardData(rankedData);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <header className="page-header">
        <div>
          <h2>Earth League 🏆</h2>
          <p className="text-secondary">Compete with other departments and hostels to reduce carbon footprint.</p>
        </div>
      </header>

      <div className="leaderboard-content">
        <div className="league-stats glass-panel">
          <div className="stat-box">
            <Flame className="stat-icon orange" />
            <div className="stat-info">
              <span className="stat-value">5 Days</span>
              <span className="stat-label">Your Streak</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-box">
            <Trophy className="stat-icon yellow" />
            <div className="stat-info">
              <span className="stat-value">Rank #2</span>
              <span className="stat-label">Mech Engg</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-box">
            <TrendingUp className="stat-icon green" />
            <div className="stat-info">
              <span className="stat-value">Top 15%</span>
              <span className="stat-label">Global Standing</span>
            </div>
          </div>
        </div>

        <div className="board-panel glass-panel">
          <div className="board-header">
            <div className="board-tabs">
              <button 
                className={`board-tab ${activeTab === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                Departments
              </button>
              <button 
                className={`board-tab ${activeTab === 'hostels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hostels')}
              >
                Hostels
              </button>
              <button 
                className={`board-tab ${activeTab === 'global' ? 'active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                Global
              </button>
            </div>
            
            <span className="season-timer">Season ends in: <strong className="text-gradient">14 Days</strong></span>
          </div>

          <div className="rankings-list">
            <div className="ranking-header">
              <div className="col-rank">Rank</div>
              <div className="col-name">Team</div>
              <div className="col-points">Eco Points</div>
              <div className="col-trend">Weekly Trend</div>
            </div>

            {leaderboardData.map((item) => (
              <div key={item.name} className={`ranking-row ${item.isUserDept ? 'highlight' : ''}`}>
                <div className="col-rank">
                  {item.rank === 1 ? <Medal color="#fbbf24" size={24} /> : 
                   item.rank === 2 ? <Medal color="#94a3b8" size={24} /> : 
                   item.rank === 3 ? <Medal color="#b45309" size={24} /> : 
                   <span className="rank-number">{item.rank}</span>}
                </div>
                <div className="col-name">
                  <span className="team-avatar">{item.avatar}</span>
                  <span className="team-name">
                    {item.name}
                    {item.isUserDept && <span className="you-badge">You</span>}
                  </span>
                </div>
                <div className="col-points font-heading">{item.points.toLocaleString()}</div>
                <div className={`col-trend ${item.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {item.trend.startsWith('+') ? '↑' : '↓'} {item.trend.replace(/[+-]/, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
