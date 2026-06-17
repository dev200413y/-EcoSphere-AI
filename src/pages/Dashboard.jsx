import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Leaf, TrendingDown, Users, Zap, Flame, Droplets } from 'lucide-react';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';



function Dashboard() {
  const [activeTab, setActiveTab] = useState('timeMachine');
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User
        const userRef = doc(db, 'users', 'demo_user_123');
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          setError("User document not found. The database might still be seeding. Please refresh.");
        }

        // Fetch Carbon History
        const historyRef = collection(db, 'users', 'demo_user_123', 'carbonHistory');
        const q = query(historyRef, orderBy('year', 'asc'));
        const historySnap = await getDocs(q);
        const historyData = historySnap.docs.map(d => d.data());
        setChartData(historyData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="flex-center" style={{height: '100%', color: '#ef4444'}}>Error: {error}. Check console and ensure Firestore rules allow read/write.</div>;
  if (!user) return <div className="flex-center" style={{height: '100%'}}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <div>
          <h2>Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="text-secondary">Here is your behavioral impact summary.</p>
        </div>
        <div className="impact-badge glass-panel">
          <Leaf className="accent-icon" />
          <span>{user.globalRank} Sustainable</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-panel tree-card">
          <div className="tree-visualizer">
            {user.streak >= 5 ? '🌳' : user.streak >= 3 ? '🪴' : '🌱'}
          </div>
          <div className="stat-info text-center mt-3">
            <span className="stat-label">Tree of Life</span>
            <span className="stat-value"><Flame size={20} className="text-orange-500 inline mr-1"/> {user.streak} Day Streak</span>
            <span className="stat-trend positive">Keep it up!</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><TrendingDown /></div>
          <div className="stat-info">
            <span className="stat-label">Monthly Footprint</span>
            <span className="stat-value">{user.monthlyFootprint} <span className="stat-unit">kg CO₂</span></span>
            <span className="stat-trend positive">{user.trend} from last month</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><Zap /></div>
          <div className="stat-info">
            <span className="stat-label">Energy Saved</span>
            <span className="stat-value">{user.energySaved} <span className="stat-unit">kWh</span></span>
            <span className="stat-trend positive">Equivalent to 3 days</span>
          </div>
        </div>
      </div>

      <div className="main-widget glass-panel">
        <div className="widget-header">
          <h3>Carbon Time Machine 🔮</h3>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'timeMachine' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeMachine')}
            >
              Future Projection
            </button>
            <button 
              className={`tab ${activeTab === 'twin' ? 'active' : ''}`}
              onClick={() => setActiveTab('twin')}
            >
              Carbon Twin
            </button>
          </div>
        </div>

        {activeTab === 'timeMachine' ? (
          <div className="time-machine-content">
            <div className="projection-message">
              <p>If you maintain your current habits, you will emit <strong className="text-gradient">16.5 tons CO₂</strong> by 2030.</p>
              <p>By adopting 3 new recommended habits, you can cap it at <strong className="text-gradient">6.4 tons CO₂</strong>.</p>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <ReferenceLine x="2026" stroke="var(--text-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--text-secondary)' }} />
                  <Area type="monotone" dataKey="current" stroke="#ef4444" fillOpacity={1} fill="url(#colorCurrent)" name="Current Trajectory" />
                  <Area type="monotone" dataKey="optimized" stroke="#10b981" fillOpacity={1} fill="url(#colorOptimized)" name="Optimized Trajectory" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="carbon-twin-content">
            <div className="twin-comparison">
              <div className="twin-card">
                <h4>You</h4>
                <div className="twin-avatar">{user.avatar}</div>
                <div className="twin-stats">
                  <p>Daily Bike Commute</p>
                  <p>Hostel Resident</p>
                  <h2 className="text-gradient">{user.monthlyFootprint} kg/mo</h2>
                </div>
              </div>
              <div className="vs-badge">VS</div>
              <div className="twin-card AI-twin">
                <h4>Your Digital Twin</h4>
                <div className="twin-avatar glow">🤖</div>
                <div className="twin-stats">
                  <p>Optimized Commute</p>
                  <p>Smart Energy Use</p>
                  <h2 className="text-gradient">120 kg/mo</h2>
                </div>
              </div>
            </div>
            <p className="twin-message">Your twin uses AI to optimize daily micro-decisions. You are currently in the top 15% of similar users, but you can reach the top 5% by adopting your twin's habits.</p>
            <button className="btn-primary" style={{marginTop: '1rem'}}>View Twin's Habits</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
