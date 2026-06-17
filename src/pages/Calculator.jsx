import React, { useState } from 'react';
import { Car, Home, Utensils, Trash2, Droplet, Sparkles, Activity } from 'lucide-react';
import DOMPurify from 'dompurify';
import './Calculator.css';

const DIET_EMISSIONS = { heavy: 3300, moderate: 2500, vegetarian: 1700, vegan: 1500 };
const SHOPPING_EMISSIONS = { high: 2000, medium: 1000, low: 500 };
const WASTE_EMISSIONS = { high: 1000, medium: 500, low: 100 };
const WATER_EMISSIONS = { high: 300, medium: 150, low: 50 };

function Calculator() {
  const [petrol, setPetrol] = useState('');
  const [diesel, setDiesel] = useState('');
  const [ev, setEv] = useState('');
  const [bus, setBus] = useState('');
  const [train, setTrain] = useState('');
  const [shortFlights, setShortFlights] = useState('');
  const [longFlights, setLongFlights] = useState('');

  const [electricity, setElectricity] = useState('');
  const [gas, setGas] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');

  const [diet, setDiet] = useState('moderate');
  const [shopping, setShopping] = useState('medium');
  const [waste, setWaste] = useState('medium');
  const [water, setWater] = useState('medium');

  const [isCalculating, setIsCalculating] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // Real-time calculation
  const transportTotal = ((Number(petrol) || 0) * 0.192) + ((Number(diesel) || 0) * 0.171) + ((Number(ev) || 0) * 0.05) + ((Number(bus) || 0) * 0.105) + ((Number(train) || 0) * 0.041) + ((Number(shortFlights) || 0) * 150) + ((Number(longFlights) || 0) * 800);
  const homeTotal = (((Number(electricity) || 0) * 0.233) + ((Number(gas) || 0) * 0.183)) / Math.max(1, Number(householdSize) || 1);
  const lifestyleTotal = DIET_EMISSIONS[diet] + SHOPPING_EMISSIONS[shopping];
  const extraTotal = WASTE_EMISSIONS[waste] + WATER_EMISSIONS[water];
  
  const finalTotalKg = transportTotal + homeTotal + lifestyleTotal + extraTotal;
  const finalTotalTons = (finalTotalKg / 1000).toFixed(2);

  const handleGenerateInsights = async () => {
    setIsCalculating(true);
    setAiInsight('');
    try {
      const prompt = `A user's annual carbon footprint is ${finalTotalTons} tons of CO2. Diet: ${diet}, Shopping: ${shopping}, Waste: ${waste}, Water: ${water}. Give 2 sentences of highly specific, encouraging advice to improve.`;
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}` },
        body: JSON.stringify({ model: 'mistral-tiny', messages: [{ role: 'user', content: prompt }] })
      });

      if (response.ok) {
        const data = await response.json();
        let formattedText = data.choices[0].message.content;
        // Parse markdown bold and linebreaks
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br/>');
        setAiInsight(DOMPurify.sanitize(formattedText));
      } else {
        setAiInsight("You're doing great! Try focusing on reducing home energy usage or eating less meat.");
      }
    } catch (e) {
      setAiInsight("Every action counts! Keep tracking to reach Net Zero.");
    }
    setIsCalculating(false);
  };

  return (
    <div className="calculator-container">
      <header className="page-header">
        <div>
          <h2>Carbon Calculator 🧮</h2>
          <p className="text-secondary">Enter your lifestyle data to calculate emissions in real-time.</p>
        </div>
      </header>

      <div className="calculator-layout">
        <div className="calc-form-panel">
          {/* TRANSPORT SECTION */}
          <section className="calc-section">
            <h3 className="section-title"><Car size={24} /> Transport</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Petrol Car</label><span className="unit">Annual km</span>
                <input type="number" min="0" value={petrol} onChange={e => setPetrol(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Diesel Car</label><span className="unit">Annual km</span>
                <input type="number" min="0" value={diesel} onChange={e => setDiesel(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Electric Vehicle</label><span className="unit">Annual km</span>
                <input type="number" min="0" value={ev} onChange={e => setEv(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Bus / Train</label><span className="unit">Annual km</span>
                <input type="number" min="0" value={bus || train} onChange={e => setTrain(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Short Flights</label><span className="unit">(&lt; 3 hours)</span>
                <input type="number" min="0" value={shortFlights} onChange={e => setShortFlights(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Long Flights</label><span className="unit">(&gt; 3 hours)</span>
                <input type="number" min="0" value={longFlights} onChange={e => setLongFlights(e.target.value)} />
              </div>
            </div>
          </section>

          {/* HOME ENERGY */}
          <section className="calc-section">
            <h3 className="section-title"><Home size={24} /> Home Energy</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Electricity</label><span className="unit">kWh/year</span>
                <input type="number" min="0" value={electricity} onChange={e => setElectricity(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Natural Gas</label><span className="unit">kWh/year</span>
                <input type="number" min="0" value={gas} onChange={e => setGas(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Household Size</label><span className="unit">People</span>
                <input type="number" min="1" value={householdSize} onChange={e => setHouseholdSize(e.target.value)} />
              </div>
            </div>
          </section>

          {/* LIFESTYLE & WASTE */}
          <section className="calc-section">
            <h3 className="section-title"><Utensils size={24} /> Lifestyle & Habits</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Diet</label>
                <select value={diet} onChange={e => setDiet(e.target.value)}>
                  <option value="heavy">🥩 Meat-heavy</option>
                  <option value="moderate">🍗 Meat-moderate</option>
                  <option value="vegetarian">🥚 Vegetarian</option>
                  <option value="vegan">🌱 Vegan</option>
                </select>
              </div>
              <div className="input-group">
                <label>Shopping</label>
                <select value={shopping} onChange={e => setShopping(e.target.value)}>
                  <option value="high">🛒 High (fast fashion)</option>
                  <option value="medium">🛍️ Medium (average)</option>
                  <option value="low">♻️ Low (minimalist)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Waste</label>
                <select value={waste} onChange={e => setWaste(e.target.value)}>
                  <option value="high">🗑️ High waste</option>
                  <option value="medium">♻️ Average recycle</option>
                  <option value="low">🌍 Zero waste</option>
                </select>
              </div>
              <div className="input-group">
                <label>Water Use</label>
                <select value={water} onChange={e => setWater(e.target.value)}>
                  <option value="high">🚿 High (long showers)</option>
                  <option value="medium">💧 Medium (average)</option>
                  <option value="low">🏜️ Low (conserver)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="calc-results-sidebar glass-panel">
          <h3>Your Real-time Score</h3>
          <div className="total-score-live text-gradient">{finalTotalTons}</div>
          <div className="total-score-unit">Tons CO₂e / year</div>
          
          <div className="breakdown-list">
            <div className="breakdown-item"><span>🚗 Transport:</span> <strong>{(transportTotal/1000).toFixed(2)} t</strong></div>
            <div className="breakdown-item"><span>🏠 Home:</span> <strong>{(homeTotal/1000).toFixed(2)} t</strong></div>
            <div className="breakdown-item"><span>🥗 Diet:</span> <strong>{(lifestyleTotal/1000).toFixed(2)} t</strong></div>
            <div className="breakdown-item"><span>🗑️ Habits:</span> <strong>{(extraTotal/1000).toFixed(2)} t</strong></div>
          </div>

          <button className="btn-primary full-width" onClick={handleGenerateInsights} disabled={isCalculating} style={{marginTop: '2rem'}}>
            {isCalculating ? "Analyzing..." : "Get AI Insights ✨"}
          </button>

          {aiInsight && (
            <div className="ai-insight-box animate-fade-in">
              <h4><Sparkles size={16}/> AI Coach</h4>
              <p dangerouslySetInnerHTML={{ __html: aiInsight }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calculator;
