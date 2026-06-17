import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Calculator from './pages/Calculator';
import Quests from './pages/Quests';
import EcoGPS from './pages/EcoGPS';
import Leaderboard from './pages/Leaderboard';
import { runSeed } from './utils/seedDatabase';

function App() {
  useEffect(() => {
    runSeed();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/ecogps" element={<EcoGPS />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
