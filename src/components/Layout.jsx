import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Sliders, Camera, Trophy, Map, Calculator as CalculatorIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Layout.css';
import EcoCoach from './EcoCoach';

function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', 'demo_user_123');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    };
    fetchUser();
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Carbon Twin', icon: LayoutDashboard },
    { path: '/calculator', label: 'Calculator', icon: CalculatorIcon },
    { path: '/simulator', label: 'Simulator', icon: Sliders },
    { path: '/quests', label: 'Eco Quests', icon: Camera },
    { path: '/ecogps', label: 'Eco GPS', icon: Map },
    { path: '/leaderboard', label: 'Earth League', icon: Trophy },
  ];

  return (
    <div className="layout-container">
      <nav className="sidebar glass-panel">
        <div className="logo-container">
          <div className="logo-icon">🌿</div>
          <h1 className="logo-text text-gradient">EcoSphere AI</h1>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile">
              <div className="avatar">{user.avatar}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-level text-gradient">{user.level}</span>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="main-content">
        <div className="content-wrapper animate-fade-in">
          {children}
        </div>
      </main>

      <EcoCoach />
    </div>
  );
}

export default Layout;
