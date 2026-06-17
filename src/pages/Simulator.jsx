import { useState, useEffect } from 'react';
import { Car, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Simulator.css';

function Simulator() {
  const [baseFootprint, setBaseFootprint] = useState(0); // kg/month
  const [selectedSimulations, setSelectedSimulations] = useState([]);
  const [simulationOptions, setSimulationOptions] = useState([]);

  const iconMap = { Car, Home, ShoppingBag };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch User Base Footprint
      const userSnap = await getDoc(doc(db, 'users', 'demo_user_123'));
      if (userSnap.exists()) setBaseFootprint(userSnap.data().baseFootprint);

      // Fetch Scenarios
      const scenariosSnap = await getDocs(collection(db, 'scenarios'));
      const scenariosData = scenariosSnap.docs.map(d => {
        const data = d.data();
        return { ...data, icon: iconMap[data.iconName] || Car };
      });
      setSimulationOptions(scenariosData);
    };
    fetchData();
  }, []);

  const toggleSimulation = (id) => {
    setSelectedSimulations(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const currentImpact = simulationOptions
    .filter(opt => selectedSimulations.includes(opt.id))
    .reduce((sum, opt) => sum + opt.impact, 0);

  const newFootprint = baseFootprint + currentImpact;

  return (
    <div className="simulator-container">
      <header className="page-header">
        <div>
          <h2>Lifestyle Simulator 🕹️</h2>
          <p className="text-secondary">Simulate the impact of lifestyle changes before committing.</p>
        </div>
      </header>

      <div className="simulator-layout">
        <div className="options-panel">
          <h3>Available Scenarios</h3>
          <div className="options-grid">
            {simulationOptions.map(option => {
              const isSelected = selectedSimulations.includes(option.id);
              const Icon = option.icon;
              return (
                <div 
                  key={option.id} 
                  className={`sim-card glass-panel ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSimulation(option.id)}
                >
                  <div className="sim-icon"><Icon /></div>
                  <div className="sim-details">
                    <h4>{option.title}</h4>
                    <span className="sim-impact text-gradient">{option.impact} kg/mo</span>
                  </div>
                  <div className={`checkbox ${isSelected ? 'checked' : ''}`}></div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="results-panel glass-panel">
          <h3>Simulation Results</h3>
          
          <div className="footprint-visualizer">
            <div className="footprint-box current">
              <span className="box-label">Current</span>
              <span className="box-value">{baseFootprint}</span>
              <span className="box-unit">kg CO₂</span>
            </div>
            
            <div className="transition-arrow"><ArrowRight size={32} /></div>
            
            <div className={`footprint-box simulated ${selectedSimulations.length > 0 ? 'active' : ''}`}>
              <span className="box-label">Simulated</span>
              <span className="box-value text-gradient">{newFootprint}</span>
              <span className="box-unit">kg CO₂</span>
            </div>
          </div>

          {selectedSimulations.length > 0 ? (
            <div className="impact-summary animate-fade-in">
              <div className="summary-row">
                <span>Monthly Reduction:</span>
                <strong className="text-gradient">{Math.abs(currentImpact)} kg CO₂</strong>
              </div>
              <div className="summary-row">
                <span>Annual Savings:</span>
                <strong className="text-gradient">{Math.abs(currentImpact) * 12} kg CO₂</strong>
              </div>
              <div className="summary-row">
                <span>Financial Impact:</span>
                <strong className="text-gradient">~₹{Math.abs(currentImpact) * 8} / year saved</strong>
              </div>
              <button className="btn-primary" style={{marginTop: '2rem', width: '100%'}}>
                Commit to these changes
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select scenarios from the left to see your potential impact.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulator;
